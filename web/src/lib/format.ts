import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
export const fmtDay = (d: string) => format(parseISO(d), "EEEE, d. MMMM", { locale: de });
export const fmtShort = (d: string) => format(parseISO(d), "EEE d.", { locale: de });
export const fmtDayNum = (d: string) => format(parseISO(d), "d", { locale: de });
export const fmtMonth = (d: string) => format(parseISO(d), "MMM", { locale: de });
