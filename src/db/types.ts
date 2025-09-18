import { emailFile, payment } from "./schema";

export type Payment = typeof payment.$inferSelect;
export type EmailFile = typeof emailFile.$inferSelect;
