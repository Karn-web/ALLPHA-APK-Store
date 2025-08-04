import { useEffect } from "react";

function AdBanner() {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("AdSense error:", err);
    }
  }, []);

  return (
    <ins className="adsbygoogle"
      style={{ display: "block", textAlign: "center" }}
      data-ad-client="ca-pub-4598331617141414"
      data-ad-slot="1234567890"  // 👉 Replace this with your actual Ad Slot ID
      data-ad-format="auto"
      data-full-width-responsive="true">
    </ins>
  );
}

export default AdBanner;
