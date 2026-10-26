"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import { CheckCircle as CheckCircle2 } from "@/components/ui/icons";
import { createListing, getPriceHint, updateListing } from "@/actions/listings";
import { site } from "@/config/site";
import {
  BODY_TYPES,
  FUELS,
  INVOICE_TYPES,
  MOTO_TYPES,
  MX_STATES,
  TRACTIONS,
  TRANSMISSIONS,
  labelOf,
  stateName,
} from "@/lib/constants";
import { formatMXN } from "@/lib/format";
import { photoUrl } from "@/lib/listings/photos";
import { buildTitle } from "@/lib/listings/title";
import { detectSuspicious, REVIEW_MESSAGES } from "@/lib/trust/suspicious";
import { listingSchema, type ListingInput } from "@/lib/validation/listing";
import { cn } from "@/lib/utils";
import type { CatalogBrand } from "@/types";
import { Button, LinkButton } from "@/components/ui/button";
import { ConditionInput } from "./condition-input";
import { Combobox } from "@/components/ui/combobox";
import { ListingPreview } from "./listing-preview";
import { TypeTiles } from "@/components/ui/type-tiles";
import { BodyIcon } from "@/components/ui/body-icon";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { BrandLogo } from "@/components/ui/brand-logo";
import { QuickPick } from "@/components/ui/chips";
import { Segmented } from "@/components/ui/segmented";
import { logoBrands } from "@/lib/brand-picks";
import { MX_CITIES } from "@/lib/cities";
import { PhotoUploader, type PhotoItem } from "./photo-uploader";

type FormValues = z.input<typeof listingSchema>;
type Name = FieldPath<FormValues>;

const STEPS = [
  "Tu vehículo",
  "Marca y modelo",
  "Datos del vehículo",
  "Precio y ciudad",
  "Fotos",
  "Descripción",
  "Revisión final",
] as const;
const DRAFT_KEY = "trato:draft:v1";

const STEP_FIELDS: Record<number, Name[]> = {
  0: ["vehicle_type"],
  1: ["brand", "model", "year", "version"],
  2: [
    "transmission",
    "fuel",
    "mileage_km",
    "invoice_type",
    "owners_count",
    "doors",
    "engine_liters",
    "color",
    "body_type",
    "moto_type",
    "engine_cc",
    "body_condition",
    "mechanical_condition",
  ],
  3: ["price_mxn", "state", "city"],
  5: ["description"],
};

const EXAMPLE = `Vendo mi {vehículo} por cambio de unidad. Siempre con servicio en agencia, un solo dueño.
- Factura original y tarjeta de circulación vigente.
- Llantas nuevas, aire acondicionado funcionando.
- Sin choques ni detalles mecánicos.
Se puede revisar con mecánico de tu confianza. Trato en lugar público.`;

interface Props {
  userId: string;
  catalog: { auto: CatalogBrand[]; moto: CatalogBrand[] };
  edit?: { id: string; values: Partial<FormValues>; photos: PhotoItem[] };
}

export function PublishWizard({ userId, catalog, edit }: Props) {
  const [listingId] = useState(() => edit?.id ?? crypto.randomUUID());
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<PhotoItem[]>(edit?.photos ?? []);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [priceHint, setPriceHint] = useState<number | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState<{ path: string; warnings: string[] } | null>(null);
  const [pending, start] = useTransition();
  const idRef = useRef(listingId);
  const topRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  // Al editar se ven todas las secciones a la vez (sin el tipo, que no cambia, ni la revisión final).
  const on = (n: number) => (edit ? n !== 0 && n !== 6 : step === n);

  const form = useForm<FormValues, unknown, ListingInput>({
    resolver: zodResolver(listingSchema),
    mode: "onTouched",
    defaultValues: {
      tenencia_al_corriente: false,
      negotiable: false,
      description: "",
      ...edit?.values,
    },
  });
  const {
    register,
    watch,
    setValue,
    trigger,
    setError,
    handleSubmit,
    getValues,
    reset,
    formState: { errors },
  } = form;
  const v = watch();

  // Borrador local (solo al crear).
  useEffect(() => {
    if (edit) return;
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (!raw) return;
      const d = JSON.parse(raw) as { id: string; values: FormValues; photos: PhotoItem[] };
      if (!d.id) return;
      idRef.current = d.id;
      reset(d.values);
      setPhotos((d.photos ?? []).map((p) => ({ path: p.path, url: photoUrl(p.path) })));
      setDraftRestored(true);
    } catch {
      /* borrador dañado: se ignora */
    }
  }, [edit, reset]);

  useEffect(() => {
    if (edit || done) return;
    const t = setTimeout(() => {
      try {
        localStorage.setItem(
          DRAFT_KEY,
          JSON.stringify({
            id: idRef.current,
            values: getValues(),
            photos: photos.map((p) => ({ path: p.path })),
          }),
        );
      } catch {
        /* almacenamiento lleno o bloqueado */
      }
    }, 400);
    return () => clearTimeout(t);
  }, [v, photos, edit, done, getValues]);

  const type = v.vehicle_type;
  const brands = useMemo(() => (type ? catalog[type] : []), [type, catalog]);
  const models = useMemo(
    () =>
      brands.find((b) => b.name.toLowerCase() === (v.brand ?? "").trim().toLowerCase())?.models ??
      [],
    [brands, v.brand],
  );

  const brandItems = useMemo(
    () =>
      brands.map((b) => ({ label: b.name, icon: <BrandLogo name={b.name} className="size-5" /> })),
    [brands],
  );
  const cityItems = useMemo(() => {
    if (v.state) return (MX_CITIES[v.state] ?? []).map((c) => ({ label: c }));
    // Sin estado elegido se sugiere de todo el país, indicando el estado.
    return Object.entries(MX_CITIES).flatMap(([slug, list]) =>
      list.map((c) => ({ label: c, hint: stateName(slug), data: slug })),
    );
  }, [v.state]);

  const num = (name: Name, optional = false) =>
    register(name, {
      setValueAs: (x: string) =>
        x === "" || x === undefined || x === null ? (optional ? undefined : NaN) : Number(x),
    });
  const optEnum = (name: Name) => register(name, { setValueAs: (x: string) => x || undefined });

  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  // Aviso de precio al entrar al paso 4.
  useEffect(() => {
    if ((!edit && step !== 3) || !type || !v.brand || !v.model || !v.year) return;
    let cancelled = false;
    getPriceHint({ vehicle_type: type, brand: v.brand, model: v.model, year: Number(v.year) }).then(
      (m) => !cancelled && setPriceHint(m),
    );
    return () => {
      cancelled = true;
    };
  }, [step, edit, type, v.brand, v.model, v.year]);

  const next = useCallback(async () => {
    setServerError(null);
    if (step === 4) {
      if (photos.length < site.minPhotos)
        return setPhotoError("Sube al menos 1 foto para continuar.");
      setPhotoError(null);
    } else {
      const fields = STEP_FIELDS[step];
      if (fields && !(await trigger(fields))) return;
      if (step === 2) {
        const cur = getValues();
        let bad = false;
        if (cur.vehicle_type === "auto" && !cur.body_type) {
          setError("body_type", { message: "Elige la carrocería" });
          bad = true;
        }
        if (cur.vehicle_type === "moto" && !cur.moto_type) {
          setError("moto_type", { message: "Elige el tipo de moto" });
          bad = true;
        }
        if (cur.vehicle_type === "moto" && !cur.engine_cc) {
          setError("engine_cc", { message: "Escribe la cilindrada (cc)" });
          bad = true;
        }
        if (bad) return;
      }
    }
    setStep((s) => s + 1);
    scrollTop();
  }, [step, photos.length, trigger, getValues, setError]);

  const back = () => {
    setStep((s) => Math.max(0, s - 1));
    scrollTop();
  };

  const jumpToError = (errs: Record<string, unknown>) => {
    const bad = Object.keys(errs);
    const target = Object.entries(STEP_FIELDS).find(([, f]) => f.some((n) => bad.includes(n)))?.[0];
    if (target !== undefined) {
      setStep(Number(target));
      scrollTop();
    }
  };

  const submit = handleSubmit((data) => {
    setServerError(null);
    start(async () => {
      const paths = photos.map((p) => p.path);
      const res = edit
        ? await updateListing(listingId, data, paths)
        : await createListing(idRef.current, data, paths);
      if (!res.ok) return setServerError(res.error);
      if (!edit) localStorage.removeItem(DRAFT_KEY);
      setDone({ path: res.path, warnings: res.warnings });
      scrollTop();
    });
  }, jumpToError);

  if (done) {
    return (
      <div ref={topRef} className="mx-auto max-w-lg space-y-5 text-center">
        <CheckCircle2 className="text-primary mx-auto size-14" aria-hidden />
        <h1 className="text-2xl font-extrabold">
          {edit ? "Listo, guardamos tus cambios" : "Listo, tu anuncio ya está publicado"}
        </h1>
        {done.warnings.length > 0 && (
          <div
            role="status"
            className="bg-warning-soft text-warning space-y-2 rounded-md p-4 text-left text-sm"
          >
            <p className="font-bold">Lo revisaremos antes de mostrarlo a todos</p>
            <ul className="list-disc pl-5">
              {done.warnings.map((w) => (
                <li key={w}>{w}</li>
              ))}
            </ul>
          </div>
        )}
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <LinkButton href={done.path}>Ver mi anuncio</LinkButton>
          <LinkButton href="/mis-anuncios" variant="outline">
            Ir a mis anuncios
          </LinkButton>
        </div>
      </div>
    );
  }

  const live = detectSuspicious({ description: v.description ?? "", price: 0, medianPrice: null });
  const title =
    type && v.brand && v.model && v.year
      ? buildTitle({ brand: v.brand, model: v.model, year: Number(v.year), version: v.version })
      : "";
  const H = edit ? "h2" : "h1";
  const err = (n: Name) => (errors as Record<string, { message?: string } | undefined>)[n]?.message;
  const invalid = (n: Name) => (err(n) ? true : undefined);

  return (
    <div ref={topRef} className="mx-auto max-w-5xl scroll-mt-20">
      {edit && (
        <nav
          aria-label="Secciones del anuncio"
          className="no-scrollbar bg-background/90 sticky top-20 z-20 -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 py-2 backdrop-blur md:top-22 lg:max-w-2xl"
        >
          {["Marca y modelo", "Datos", "Precio y ciudad", "Fotos", "Descripción"].map(
            (label, i) => (
              <button
                key={label}
                type="button"
                onClick={() =>
                  formRef.current?.children[i]?.scrollIntoView({
                    behavior: "smooth",
                    block: "start",
                  })
                }
                className="border-border bg-card hover:border-foreground min-h-9 shrink-0 rounded-sm border px-3 text-sm font-semibold"
              >
                {label}
              </button>
            ),
          )}
        </nav>
      )}
      {!edit && (
        <div className="mb-6 space-y-3 lg:max-w-2xl">
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-sm font-semibold">
              Paso {step + 1} de {STEPS.length} ·{" "}
              <span className="text-muted-foreground">{STEPS[step]}</span>
            </p>
            {!edit && (
              <p className="text-muted-foreground flex items-center gap-1.5 text-xs">
                <CheckCircle2 className="size-3.5" aria-hidden /> Se guarda solo
              </p>
            )}
          </div>
          <ol className="flex gap-1.5" aria-label="Progreso">
            {STEPS.map((name, i) => (
              <li key={name} className="flex-1">
                <button
                  type="button"
                  disabled={i >= step}
                  onClick={() => {
                    setStep(i);
                    scrollTop();
                  }}
                  aria-label={`Volver al paso ${i + 1}`}
                  aria-current={i === step ? "step" : undefined}
                  className={cn(
                    "block h-2 w-full rounded-full transition-colors",
                    i <= step ? "bg-primary" : "bg-muted",
                    i < step && "hover:opacity-70",
                  )}
                />
              </li>
            ))}
          </ol>
        </div>
      )}

      {draftRestored && step === 0 && (
        <p
          role="status"
          className="bg-primary-soft text-primary mb-4 flex items-center justify-between gap-3 rounded-sm p-3 text-sm"
        >
          Recuperamos tu borrador: sigues justo donde te quedaste.
          <button
            type="button"
            className="font-semibold underline"
            onClick={() => {
              localStorage.removeItem(DRAFT_KEY);
              window.location.reload();
            }}
          >
            Empezar de cero
          </button>
        </p>
      )}

      <div className="lg:grid lg:grid-cols-[minmax(0,40rem)_1fr] lg:gap-12">
        <form
          ref={formRef}
          onSubmit={(e) => e.preventDefault()}
          className={cn(
            "space-y-5",
            edit &&
              "[&>div:not(.sticky-actions)]:border-border [&>div:not(.sticky-actions)]:bg-card [&>fieldset]:border-border [&>fieldset]:bg-card space-y-6 [&>div:not(.sticky-actions)]:scroll-mt-40 [&>div:not(.sticky-actions)]:rounded-md [&>div:not(.sticky-actions)]:border [&>div:not(.sticky-actions)]:p-5 [&>fieldset]:scroll-mt-40 [&>fieldset]:rounded-md [&>fieldset]:border [&>fieldset]:p-5",
          )}
          noValidate
        >
          {on(0) && (
            <fieldset className="space-y-3">
              <legend className="mb-2 text-2xl font-extrabold">
                ¿Vas a vender un auto o una moto?
              </legend>
              <div className="grid grid-cols-2 gap-3">
                {(
                  [
                    ["auto", "Auto", "sedan"],
                    ["moto", "Moto", "chopper"],
                  ] as const
                ).map(([val, label, icon]) => (
                  <button
                    key={val}
                    type="button"
                    disabled={!!edit}
                    aria-pressed={type === val}
                    onClick={() => {
                      setValue("vehicle_type", val, { shouldValidate: true });
                      setValue("brand", "");
                      setValue("model", "");
                    }}
                    className={cn(
                      "flex min-h-36 flex-col items-center justify-center gap-3 rounded-md border-2 text-lg font-bold transition-colors",
                      type === val
                        ? "border-foreground bg-foreground text-background"
                        : "border-border bg-card hover:border-foreground",
                    )}
                  >
                    <BodyIcon value={icon} className="h-14 w-20" />
                    <span className="font-display text-2xl">{label}</span>
                  </button>
                ))}
              </div>
              {err("vehicle_type") && (
                <p role="alert" className="text-danger text-sm">
                  {err("vehicle_type")}
                </p>
              )}
              <p className="text-muted-foreground text-sm">
                Es gratis, sin comisión y tu borrador se guarda solo. Puedes salir y volver cuando
                quieras.
              </p>
            </fieldset>
          )}

          {on(1) && (
            <div className="space-y-4">
              <H className="text-2xl font-extrabold">
                ¿Cuál es tu {type === "auto" ? "auto" : "moto"}?
              </H>
              <Field label="Marca" error={err("brand")}>
                <Combobox
                  label="Marca"
                  placeholder="Ej. Nissan"
                  value={v.brand ?? ""}
                  invalid={invalid("brand")}
                  items={brandItems}
                  onChange={(x) => setValue("brand", x, { shouldValidate: true })}
                />
              </Field>
              {!v.brand && (
                <QuickPick
                  label="Marcas populares"
                  items={type ? logoBrands(type, 12) : []}
                  icon={(b) => <BrandLogo name={b} className="size-5" />}
                  onPick={(b) => setValue("brand", b, { shouldValidate: true })}
                />
              )}
              <Field
                label="Modelo"
                error={err("model")}
                hint="¿No aparece? Escríbelo tal cual: también lo aceptamos."
              >
                <Combobox
                  label="Modelo"
                  placeholder="Ej. Versa"
                  value={v.model ?? ""}
                  invalid={invalid("model")}
                  items={models.map((m) => ({ label: m.name }))}
                  max={10}
                  onChange={(x) => setValue("model", x, { shouldValidate: true })}
                />
              </Field>
              {!v.model && models.length > 0 && (
                <QuickPick
                  label={`Modelos de ${v.brand}`}
                  items={models.slice(0, 12).map((m) => m.name)}
                  onPick={(m) => setValue("model", m, { shouldValidate: true })}
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <Field label="Año" error={err("year")}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="2019"
                    aria-invalid={invalid("year")}
                    {...num("year")}
                  />
                </Field>
                <Field label="Versión (opcional)" error={err("version")}>
                  <Input placeholder="Advance" {...register("version")} />
                </Field>
              </div>
            </div>
          )}

          {on(2) && (
            <div className="space-y-4">
              <H className="text-2xl font-extrabold">Características</H>
              <Segmented
                label="Transmisión"
                value={v.transmission}
                options={TRANSMISSIONS}
                error={err("transmission")}
                onChange={(x) => setValue("transmission", x, { shouldValidate: true })}
              />
              <Segmented
                label="Combustible"
                value={v.fuel}
                options={FUELS}
                error={err("fuel")}
                onChange={(x) => setValue("fuel", x, { shouldValidate: true })}
              />
              <Field label="Kilometraje" error={err("mileage_km")}>
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="85000"
                  aria-invalid={invalid("mileage_km")}
                  {...num("mileage_km")}
                />
              </Field>

              {type === "auto" ? (
                <>
                  <TypeTiles
                    label="Carrocería"
                    value={v.body_type}
                    options={BODY_TYPES}
                    error={err("body_type")}
                    onChange={(x) => setValue("body_type", x as never, { shouldValidate: true })}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Puertas" error={err("doors")}>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder="4"
                        {...num("doors", true)}
                      />
                    </Field>
                    <Field label="Motor (L)" error={err("engine_liters")}>
                      <Input
                        type="number"
                        step="0.1"
                        inputMode="decimal"
                        placeholder="1.6"
                        {...num("engine_liters", true)}
                      />
                    </Field>
                    <Field label="Tracción">
                      <Select defaultValue="" {...optEnum("traction")}>
                        <option value="">—</option>
                        {TRACTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                    </Field>
                  </div>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <TypeTiles
                      label="Tipo de moto"
                      value={v.moto_type}
                      options={MOTO_TYPES}
                      error={err("moto_type")}
                      onChange={(x) => setValue("moto_type", x as never, { shouldValidate: true })}
                    />
                  </div>
                  <Field label="Cilindrada (cc)" error={err("engine_cc")}>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder="150"
                      aria-invalid={invalid("engine_cc")}
                      {...num("engine_cc", true)}
                    />
                  </Field>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Color (opcional)">
                  <Input placeholder="Blanco" {...register("color")} />
                </Field>
                <Field label="Dueños (opcional)" error={err("owners_count")}>
                  <Input
                    type="number"
                    inputMode="numeric"
                    placeholder="1"
                    {...num("owners_count", true)}
                  />
                </Field>
              </div>
              <Field label="Factura" error={err("invoice_type")}>
                <Select
                  defaultValue=""
                  aria-invalid={invalid("invoice_type")}
                  {...register("invoice_type")}
                >
                  <option value="" disabled>
                    Elige
                  </option>
                  {INVOICE_TYPES.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Placas de (opcional)">
                <Select defaultValue="" {...optEnum("plates_state")}>
                  <option value="">—</option>
                  {MX_STATES.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-5 accent-[var(--primary)]"
                  {...register("tenencia_al_corriente")}
                />{" "}
                Tenencia al corriente
              </label>

              <div className="border-border space-y-5 border-t pt-5">
                <div>
                  <h2 className="text-xl">Estado del vehículo</h2>
                  <p className="text-muted-foreground mt-1 text-sm">
                    Dale al comprador una idea clara, de 0 a 100. Es tu calificación como vendedor;
                    ser honesto evita regateos y visitas en vano.
                  </p>
                </div>
                <ConditionInput
                  label={type === "moto" ? "Estado de la estética" : "Estado de la carrocería"}
                  hint="Pintura, golpes, rayones, cristales y vestiduras."
                  value={v.body_condition}
                  error={err("body_condition")}
                  onChange={(n) =>
                    setValue("body_condition", n, { shouldValidate: true, shouldDirty: true })
                  }
                />
                <ConditionInput
                  label="Estado de la mecánica"
                  hint="Motor, transmisión, frenos, suspensión y sistema eléctrico."
                  value={v.mechanical_condition}
                  error={err("mechanical_condition")}
                  onChange={(n) =>
                    setValue("mechanical_condition", n, { shouldValidate: true, shouldDirty: true })
                  }
                />
              </div>
            </div>
          )}

          {on(3) && (
            <div className="space-y-4">
              <H className="text-2xl font-extrabold">Precio y ubicación</H>
              <Field
                label="Precio (MXN)"
                error={err("price_mxn")}
                hint={
                  v.price_mxn && !Number.isNaN(Number(v.price_mxn))
                    ? formatMXN(Number(v.price_mxn))
                    : undefined
                }
              >
                <Input
                  type="number"
                  inputMode="numeric"
                  placeholder="289000"
                  aria-invalid={invalid("price_mxn")}
                  {...num("price_mxn")}
                />
              </Field>
              {priceHint && (
                <p role="status" className="bg-primary-soft text-primary rounded-sm p-3 text-sm">
                  El precio medio de autos y motos parecidos al tuyo es{" "}
                  <strong>{formatMXN(priceHint)}</strong>. Un precio cercano suele venderse más
                  rápido, y puedes cambiarlo cuando quieras.
                </p>
              )}
              <label className="flex min-h-11 items-center gap-3 text-sm font-medium">
                <input
                  type="checkbox"
                  className="size-5 accent-[var(--primary)]"
                  {...register("negotiable")}
                />{" "}
                Precio negociable
              </label>
              <Field label="Estado" error={err("state")}>
                <Select defaultValue="" aria-invalid={invalid("state")} {...register("state")}>
                  <option value="" disabled>
                    Elige tu estado
                  </option>
                  {MX_STATES.map((s) => (
                    <option key={s.slug} value={s.slug}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Ciudad o municipio" error={err("city")}>
                <Combobox
                  label="Ciudad o municipio"
                  placeholder="Monterrey"
                  autoComplete="address-level2"
                  value={v.city ?? ""}
                  invalid={invalid("city")}
                  items={cityItems}
                  onChange={(x) => setValue("city", x, { shouldValidate: true })}
                  onSelect={(it) => {
                    // Si aún no eligieron estado, la ciudad lo completa.
                    const st = it.data as string | undefined;
                    if (st && !v.state) setValue("state", st, { shouldValidate: true });
                  }}
                />
              </Field>
            </div>
          )}

          {on(4) && (
            <div className="space-y-4">
              <H className="text-2xl font-extrabold">Agrega fotos</H>
              <p className="text-muted-foreground text-sm">
                Un auto o moto con buenas fotos se vende más rápido. Toma el frente, los costados,
                el interior, el tablero con el kilometraje y el motor, con luz de día. Quitamos la
                ubicación de cada foto antes de subirla, así tu domicilio queda protegido.
              </p>
              <PhotoUploader
                userId={userId}
                listingId={idRef.current}
                photos={photos}
                onChange={(p) => {
                  setPhotos(p);
                  setPhotoError(null);
                }}
              />
              {photoError && (
                <p role="alert" className="text-danger text-sm">
                  {photoError}
                </p>
              )}
            </div>
          )}

          {on(5) && (
            <div className="space-y-4">
              <H className="text-2xl font-extrabold">Cuéntale al comprador cómo está</H>
              <Field
                label="Descripción"
                error={err("description")}
                hint={`${(v.description ?? "").length}/${site.maxDescription}`}
              >
                <Textarea
                  rows={8}
                  maxLength={site.maxDescription}
                  placeholder="Servicios, llantas, detalles de pintura, razón de venta… lo que tú preguntarías al comprar."
                  {...register("description")}
                />
              </Field>
              <Button
                variant="soft"
                onClick={() =>
                  setValue(
                    "description",
                    EXAMPLE.replace("{vehículo}", type === "auto" ? "auto" : "moto"),
                    { shouldValidate: true },
                  )
                }
              >
                Usar texto de ejemplo
              </Button>
              <p className="text-muted-foreground text-xs">
                No necesitas poner tu teléfono: los compradores te escriben por WhatsApp desde tu
                anuncio y tu número no se publica.
              </p>
              {live.length > 0 && (
                <ul
                  role="status"
                  className="bg-warning-soft text-warning space-y-1 rounded-sm p-3 text-sm"
                >
                  {live.map((r) => (
                    <li key={r}>{REVIEW_MESSAGES[r]}</li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {on(6) && (
            <div className="space-y-4">
              <H className="text-2xl font-extrabold">Revisa cómo se verá tu anuncio</H>
              <div className="grid gap-5 sm:grid-cols-[14rem_1fr]">
                <ListingPreview
                  cover={photos[0]?.url}
                  title={title}
                  price={v.price_mxn ? Number(v.price_mxn) : undefined}
                  negotiable={v.negotiable}
                  year={v.year ? Number(v.year) : undefined}
                  km={v.mileage_km !== undefined ? Number(v.mileage_km) : undefined}
                  city={v.city}
                  state={v.state}
                />
                <ul className="space-y-2 text-sm">
                  {[
                    [
                      `${photos.length} ${photos.length === 1 ? "foto" : "fotos"}`,
                      photos.length >= 5,
                    ],
                    [
                      `${labelOf(TRANSMISSIONS, v.transmission)} · ${labelOf(FUELS, v.fuel)} · ${labelOf(INVOICE_TYPES, v.invoice_type)}`,
                      true,
                    ],
                    [
                      `Carrocería ${v.body_condition}/100 · mecánica ${v.mechanical_condition}/100`,
                      v.body_condition !== undefined && v.mechanical_condition !== undefined,
                    ],
                    [
                      (v.description ?? "").trim().length >= 80
                        ? "Descripción completa"
                        : "Una descripción más larga genera más confianza",
                      (v.description ?? "").trim().length >= 80,
                    ],
                  ].map(([text, ok]) => (
                    <li key={String(text)} className="flex items-start gap-2">
                      <CheckCircle2
                        className={cn(
                          "mt-0.5 size-4 shrink-0",
                          ok ? "text-primary" : "text-muted-foreground/50",
                        )}
                        aria-hidden
                      />
                      <span className={ok ? undefined : "text-muted-foreground"}>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>
              {v.description && (
                <p className="border-border bg-card rounded-md border p-4 text-sm whitespace-pre-line">
                  {v.description}
                </p>
              )}
              <p className="text-muted-foreground text-xs">
                Al publicar aceptas los{" "}
                <Link href="/terminos" className="underline" target="_blank">
                  términos
                </Link>
                . Tu anuncio dura {site.listingTtlDays} días y puedes editarlo, pausarlo, renovarlo
                o marcarlo como vendido cuando quieras.
              </p>
              {serverError && (
                <p role="alert" className="bg-danger/10 text-danger rounded-sm p-3 text-sm">
                  {serverError}
                </p>
              )}
            </div>
          )}

          <div className="sticky-actions bg-background/95 border-border sticky bottom-14 z-20 -mx-4 flex gap-3 border-t px-4 py-3 backdrop-blur md:static md:mx-0 md:border-0 md:bg-transparent md:px-0 md:pt-2 md:backdrop-blur-none">
            {edit ? (
              <>
                <LinkButton href="/mis-anuncios" variant="outline">
                  Cancelar
                </LinkButton>
                <Button size="lg" className="flex-1" onClick={submit} disabled={pending}>
                  {pending ? "Guardando…" : "Guardar cambios"}
                </Button>
              </>
            ) : (
              <>
                {step > 0 && (
                  <Button variant="outline" onClick={back} disabled={pending}>
                    Atrás
                  </Button>
                )}
                {step < STEPS.length - 1 ? (
                  <Button size="lg" className="flex-1" onClick={next}>
                    Continuar
                  </Button>
                ) : (
                  <Button size="lg" className="flex-1" onClick={submit} disabled={pending}>
                    {pending ? "Publicando…" : edit ? "Guardar cambios" : "Publicar anuncio"}
                  </Button>
                )}
              </>
            )}
          </div>
        </form>
        <aside className="hidden lg:block" aria-label="Vista previa">
          <div className="sticky top-28 space-y-3">
            <p className="text-muted-foreground text-sm font-medium">Así se verá tu anuncio</p>
            <ListingPreview
              cover={photos[0]?.url}
              title={title}
              price={v.price_mxn ? Number(v.price_mxn) : undefined}
              negotiable={v.negotiable}
              year={v.year ? Number(v.year) : undefined}
              km={v.mileage_km !== undefined ? Number(v.mileage_km) : undefined}
              city={v.city}
              state={v.state}
            />
            <p className="text-muted-foreground text-xs">
              Se actualiza mientras escribes. Un buen título, una portada clara y un precio justo
              hacen la diferencia.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
