import { getProfileEvents } from "@venuecms/sdk-next";
import { getTranslations } from "next-intl/server";

import { Link } from "@/lib/i18n";

/**
 * "/ past concerts": the past events list on the profile's own page. Only
 * drawn when there is at least one past event for it to show, using the same
 * filter that list does (events that started before now).
 */
export const ProfilePastConcertsLink = async ({ slug }: { slug: string }) => {
  const [{ data: events }, t] = await Promise.all([
    getProfileEvents({ slug, limit: 1, lt: Date.now(), dir: "desc" }),
    getTranslations("profiles"),
  ]);

  if (!events?.records.length) {
    return null;
  }

  return (
    <span>
      <span aria-hidden className="opacity-30">
        /
      </span>{" "}
      <Link
        href={`/artists/${slug}#past-events`}
        className="hover:text-primary"
      >
        {t("past_concerts")}
      </Link>
    </span>
  );
};
