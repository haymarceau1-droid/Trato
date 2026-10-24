import { SearchPage, searchMetadata } from "@/components/listings/search-page";

type Props = Parameters<typeof SearchPage>[1];

export const generateMetadata = (props: Props) => searchMetadata("moto", props);

export default function Page(props: Props) {
  return SearchPage("moto", props);
}
