"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateFacebook, updatePhone, updateProfile } from "@/actions/account";
import { MX_STATES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Field, Input, Select } from "@/components/ui/field";

export function PhoneForm({ initial }: { initial?: string | null }) {
  const router = useRouter();
  const [phone, setPhone] = useState(initial ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updatePhone(phone);
          setMsg(res.ok ? { ok: true, text: "Número guardado." } : { ok: false, text: res.error });
          if (res.ok) router.refresh();
        });
      }}
    >
      <Field
        label="Tu WhatsApp"
        hint="Los compradores te contactarán aquí. Solo lo ve quien inicia sesión y quiere ver tu auto o moto; nunca se publica."
      >
        <div className="flex gap-2">
          <span className="border-border bg-muted grid min-h-11 place-items-center rounded-sm border px-3 text-sm font-semibold">
            +52
          </span>
          <Input
            type="tel"
            inputMode="tel"
            placeholder="55 1234 5678"
            value={phone.replace(/^\+52/, "")}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
        </div>
      </Field>
      <Button type="submit" disabled={pending}>
        Guardar número
      </Button>
      {msg && (
        <p
          role={msg.ok ? "status" : "alert"}
          className={msg.ok ? "text-primary text-sm" : "text-danger text-sm"}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}

export function FacebookForm({ initial }: { initial?: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(initial ?? "");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-3"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateFacebook(value);
          setMsg(
            res.ok
              ? { ok: true, text: value.trim() ? "Facebook guardado." : "Facebook quitado." }
              : { ok: false, text: res.error },
          );
          if (res.ok) router.refresh();
        });
      }}
    >
      <Field
        label="Tu Facebook (opcional)"
        hint="Pega el enlace de tu perfil o tu usuario. Los compradores verán un botón “Contactar en Facebook” que abre Messenger; tu perfil no se muestra."
      >
        <Input
          placeholder="facebook.com/tu.usuario"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          maxLength={120}
        />
      </Field>
      <Button type="submit" variant="outline" disabled={pending}>
        Guardar Facebook
      </Button>
      {msg && (
        <p
          role={msg.ok ? "status" : "alert"}
          className={msg.ok ? "text-primary text-sm" : "text-danger text-sm"}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}

export function ProfileForm({
  initial,
}: {
  initial: { display_name: string; state: string | null; city: string | null };
}) {
  const router = useRouter();
  const [v, setV] = useState({
    display_name: initial.display_name,
    state: initial.state ?? "",
    city: initial.city ?? "",
  });
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const res = await updateProfile(v);
          setMsg(
            res.ok ? { ok: true, text: "Perfil actualizado." } : { ok: false, text: res.error },
          );
          if (res.ok) router.refresh();
        });
      }}
    >
      <Field label="Nombre que verán los compradores">
        <Input
          value={v.display_name}
          onChange={(e) => setV({ ...v, display_name: e.target.value })}
          required
          minLength={2}
          maxLength={50}
        />
      </Field>
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Estado">
          <Select value={v.state} onChange={(e) => setV({ ...v, state: e.target.value })}>
            <option value="">—</option>
            {MX_STATES.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Ciudad">
          <Input
            value={v.city}
            onChange={(e) => setV({ ...v, city: e.target.value })}
            maxLength={60}
          />
        </Field>
      </div>
      <Button type="submit" disabled={pending}>
        Guardar perfil
      </Button>
      {msg && (
        <p
          role={msg.ok ? "status" : "alert"}
          className={msg.ok ? "text-primary text-sm" : "text-danger text-sm"}
        >
          {msg.text}
        </p>
      )}
    </form>
  );
}
