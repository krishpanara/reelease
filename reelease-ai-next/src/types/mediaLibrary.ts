import { MediaGridProps } from "./attachment";

export interface ExtendedMediaGridProps extends MediaGridProps {
  onUpload?: () => void
}