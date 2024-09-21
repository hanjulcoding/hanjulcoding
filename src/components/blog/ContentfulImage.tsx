import { useState, useEffect } from "react";
import { client } from "@/lib/contentful";

const ContentfulImage = ({ assetId }: { assetId: string }) => {
  interface ImageData {
    internalName: string;
    image: {
      url: string;
    };
  }

  const [image, setImage] = useState<ImageData | null>(null);
  useEffect(() => {
    async function getImage() {
      let image: ImageData | null = null;
      try {
        image = await client.getRichImage(assetId || "");
      } catch (error) {
        return false;
      }

      // Rich Text를 HTML로 변환
      setImage(image);
    }

    getImage();
  }, []);

  return <>{image && <img src={image?.image?.url || ""} alt={image?.internalName || ""} />}</>;
};

export default ContentfulImage;
