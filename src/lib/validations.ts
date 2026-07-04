import { z } from "zod";

// Validation applicative exécutée juste avant chaque écriture Supabase.
// Ne dépend pas des contraintes CHECK de la base : elle doit rester correcte
// même si un schéma DB moins strict est appliqué par erreur.

const phoneRegex = /^\+?[0-9\s\-]{8,20}$/;

export const producerSchema = z.object({
  firstName: z.string().trim().min(1, "Le prénom est requis."),
  lastName: z.string().trim().min(1, "Le nom est requis."),
  village: z.string().trim().min(1, "Le village est requis."),
  cooperative: z.string().trim().optional(),
  phone: z.string().trim().regex(phoneRegex, "Numéro de téléphone invalide."),
  area: z
    .number({ invalid_type_error: "La surface doit être un nombre." })
    .min(0, "La surface ne peut pas être négative."),
});

export const parcelSchema = z.object({
  producerId: z.string().trim().min(1, "Sélectionnez un producteur."),
  crop: z.string().trim().min(1, "La culture est requise."),
  area: z
    .number({ invalid_type_error: "La surface doit être un nombre." })
    .min(0, "La surface ne peut pas être négative."),
  coordinates: z.string().trim().optional(),
});

export const harvestSchema = z.object({
  parcelId: z.string().trim().min(1, "Sélectionnez une parcelle."),
  quality: z.enum(["A", "B", "C"]),
  weight: z
    .number({ invalid_type_error: "Le poids doit être un nombre." })
    .positive("Le poids doit être supérieur à 0."),
});

export const campaignSchema = z
  .object({
    name: z.string().trim().min(1, "Le nom de la campagne est requis."),
    startDate: z.string().trim().min(1, "La date de début est requise."),
    endDate: z.string().trim().optional(),
  })
  .refine(
    (data) => !data.endDate || data.endDate >= data.startDate,
    { message: "La date de fin doit être postérieure à la date de début.", path: ["endDate"] }
  );

export const distributionSchema = z.object({
  producer: z.string().trim().min(1, "Sélectionnez un producteur."),
  product: z.string().trim().min(1, "Sélectionnez un produit."),
  qty: z
    .number({ invalid_type_error: "La quantité doit être un nombre." })
    .int()
    .positive("La quantité doit être supérieure à 0."),
  amount: z
    .number({ invalid_type_error: "Le montant doit être un nombre." })
    .min(0, "Le montant ne peut pas être négatif.")
    .nullable()
    .optional(),
});

export const restockSchema = z.object({
  product: z.string().trim().min(1, "Sélectionnez un produit."),
  qty: z
    .number({ invalid_type_error: "La quantité doit être un nombre." })
    .int()
    .positive("La quantité doit être supérieure à 0."),
});

/** Retourne le premier message d'erreur lisible d'un résultat safeParse, ou null si valide. */
export function firstIssueMessage(result: { success: boolean; error?: z.ZodError }): string | null {
  if (result.success || !result.error) return null;
  return result.error.issues[0]?.message ?? "Données invalides.";
}
