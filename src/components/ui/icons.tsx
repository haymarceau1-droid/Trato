import type { ComponentProps } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  ArrowRight01Icon,
  ArrowUpRight01Icon,
  Calendar01Icon,
  Call02Icon,
  Car01Icon,
  Car02Icon,
  Cancel01Icon,
  Certificate01Icon,
  CheckmarkBadge01Icon,
  CheckmarkCircle02Icon,
  Clock01Icon,
  Delete02Icon,
  DragDropVerticalIcon,
  Edit02Icon,
  EngineIcon,
  FavouriteIcon,
  FullScreenIcon,
  Flag01Icon,
  Fuel01Icon,
  GaugeIcon,
  HandCoinsIcon,
  HandshakeIcon,
  Home01Icon,
  Image01Icon,
  Invoice01Icon,
  Location01Icon,
  Mail01Icon,
  Motorbike01Icon,
  PaletteIcon,
  PauseIcon,
  PlayIcon,
  PlusSignCircleIcon,
  PlusSignIcon,
  Refresh01Icon,
  Search01Icon,
  SecurityCheckIcon,
  Settings01Icon,
  Share01Icon,
  SlidersHorizontalIcon,
  StarIcon,
  Tag01Icon,
  Tick02Icon,
  TireIcon,
  User02Icon,
  UserGroupIcon,
  ViewIcon,
} from "@hugeicons/core-free-icons";

/**
 * Iconos Hugeicons (trazo redondeado) con los mismos nombres que usaba la interfaz.
 * `weight`: "bold" engrosa el trazo; "fill" rellena la forma (p. ej. favorito activo).
 */
type Hugeicon = Parameters<typeof HugeiconsIcon>[0]["icon"];
export type IconWeight = "regular" | "bold" | "duotone" | "fill";
export type IconProps = Omit<ComponentProps<"svg">, "ref"> & { weight?: IconWeight };
export type IconType = (props: IconProps) => React.ReactElement;

function make(icon: Hugeicon): IconType {
  return function Icon({ weight = "regular", className, ...rest }: IconProps) {
    return (
      <HugeiconsIcon
        icon={icon}
        size="1em"
        strokeWidth={weight === "bold" ? 2.1 : 1.6}
        className={[weight === "fill" ? "[&_path]:fill-current" : "", className]
          .filter(Boolean)
          .join(" ")}
        {...(rest as object)}
      />
    );
  };
}

export const ArrowUpRight = make(ArrowUpRight01Icon);
export const CalendarBlank = make(Calendar01Icon);
export const CaretLeft = make(ArrowLeft01Icon);
export const CaretRight = make(ArrowRight01Icon);
export const Car = make(Car01Icon);
export const CarProfile = make(Car02Icon);
export const Certificate = make(Certificate01Icon);
export const Check = make(Tick02Icon);
export const CheckCircle = make(CheckmarkCircle02Icon);
export const Clock = make(Clock01Icon);
export const DotsSixVertical = make(DragDropVerticalIcon);
export const Engine = make(EngineIcon);
export const EnvelopeSimple = make(Mail01Icon);
export const Eye = make(ViewIcon);
export const Flag = make(Flag01Icon);
export const GasPump = make(Fuel01Icon);
export const Gauge = make(GaugeIcon);
export const GearSix = make(Settings01Icon);
export const HandCoins = make(HandCoinsIcon);
export const Handshake = make(HandshakeIcon);
export const Heart = make(FavouriteIcon);
export const House = make(Home01Icon);
export const ImageSquare = make(Image01Icon);
export const MagnifyingGlass = make(Search01Icon);
export const MapPin = make(Location01Icon);
export const MapPinArea = make(Location01Icon);
export const Motorcycle = make(Motorbike01Icon);
export const Palette = make(PaletteIcon);
export const Pause = make(PauseIcon);
export const PencilSimple = make(Edit02Icon);
export const Phone = make(Call02Icon);
export const Play = make(PlayIcon);
export const Plus = make(PlusSignIcon);
export const PlusCircle = make(PlusSignCircleIcon);
export const Receipt = make(Invoice01Icon);
export const SealCheck = make(CheckmarkBadge01Icon);
export const ShareNetwork = make(Share01Icon);
export const ShieldCheck = make(SecurityCheckIcon);
export const SlidersHorizontal = make(SlidersHorizontalIcon);
export const Star = make(StarIcon);
export const Tag = make(Tag01Icon);
export const Tire = make(TireIcon);
export const Trash = make(Delete02Icon);
export const User = make(User02Icon);
export const Users = make(UserGroupIcon);
export const X = make(Cancel01Icon);
export const ArrowsOut = make(FullScreenIcon);
export const ArrowsClockwise = make(Refresh01Icon);
