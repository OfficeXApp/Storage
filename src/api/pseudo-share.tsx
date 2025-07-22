/**
 * Centralized Solution to Sharing
 * Needs to be upgraded in future to decentralized
 */

export const createPseudoShareLink = async ({
  title,
  url,
  ref = "",
}: {
  title: string;
  url: string;
  ref?: string;
}) => {
  const body = {
    route: "POST/gift",
    payload: {
      title,
      url,
      ref,
    },
  };
  try {
    const response = await fetch(
      "https://api.legions.bot/api/w/officex/jobs/run_wait_result/f/f/officex/officex_pseudo_url_shortener",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer bTNgi1DBCDeQ5G4m1lvb0vkNCt1iVGpL",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to create pseudoshare link");
    }

    const data = await response.json();
    const shareLink = `https://officex.app/gift?id=${data.id}&ref=${ref}`;
    return shareLink;
  } catch (error) {
    console.error("Error generating pseudoshare link:", error);
    return url;
  }
};

export const getPseudoShareLink = async (
  id: string
): Promise<{ url: string; title: string }> => {
  const body = {
    route: "GET/gift",
    payload: {
      id,
    },
  };
  try {
    const response = await fetch(
      "https://api.legions.bot/api/w/officex/jobs/run_wait_result/f/f/officex/officex_pseudo_url_shortener",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer bTNgi1DBCDeQ5G4m1lvb0vkNCt1iVGpL",
        },
        body: JSON.stringify(body),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to get pseudoshare link");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting pseudoshare link:", error);
    return { url: "", title: "Not Found" };
  }
};

export function updateRefInShareUrl(
  originalUrl: string,
  newRef: string
): string {
  const url = new URL(originalUrl);

  // Update or add the 'ref' parameter
  url.searchParams.set("ref", newRef);

  return url.toString();
}
