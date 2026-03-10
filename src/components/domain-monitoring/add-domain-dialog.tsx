"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Globe, Loader2 } from "lucide-react";

import { useAddDomain } from "@/hooks/use-domain-monitoring";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

// ── Validation ──────────────────────────────────────────────────────

const domainSchema = z.object({
    domain: z
        .string()
        .min(1, "Domain is required")
        .transform((val) =>
            val
                .replace(/^https?:\/\//, "")
                .replace(/^www\./, "")
                .replace(/\/.*$/, "")
                .trim()
                .toLowerCase()
        )
        .refine(
            (val) => /^[a-z0-9][a-z0-9.-]+\.[a-z]{2,}$/.test(val),
            "Please enter a valid domain (e.g. mybrand.com)"
        ),
    intervalHours: z.coerce.number().int().min(1).default(6),
});

type DomainFormValues = z.infer<typeof domainSchema>;

// ── Component ───────────────────────────────────────────────────────

interface AddDomainDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function AddDomainDialog({ open, onOpenChange }: AddDomainDialogProps) {
    const addDomain = useAddDomain();

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<DomainFormValues>({
        defaultValues: {
            domain: "",
            intervalHours: 6,
        },
    });

    const onSubmit = (data: DomainFormValues) => {
        addDomain.mutate(
            { domain: data.domain, intervalHours: data.intervalHours },
            {
                onSuccess: (entry) => {
                    toast.success(`Added ${entry.officialDomainNormalized} to watchlist`);
                    reset();
                    onOpenChange(false);
                },
                onError: (err) => {
                    toast.error(err.message || "Failed to add domain");
                },
            }
        );
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Add Domain to Watchlist
                    </DialogTitle>
                    <DialogDescription>
                        Enter the domain you want to monitor for look-alikes and typosquatting attempts. We&apos;ll normalize URLs automatically.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="space-y-2">
                        <Label htmlFor="domain">Domain</Label>
                        <Input
                            id="domain"
                            placeholder="e.g. mybrand.com or https://www.mybrand.com"
                            {...register("domain")}
                            autoFocus
                            aria-invalid={!!errors.domain}
                            aria-describedby={errors.domain ? "domain-error" : undefined}
                        />
                        {errors.domain && (
                            <p id="domain-error" className="text-sm text-destructive">
                                {errors.domain.message}
                            </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                            We&apos;ll strip protocols, www prefixes, and paths automatically.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="interval">Scan Interval</Label>
                        <Select
                            defaultValue="6"
                            onValueChange={(val) => setValue("intervalHours", parseInt(val, 10))}
                        >
                            <SelectTrigger id="interval">
                                <SelectValue placeholder="Select interval" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="1">Every 1 hour</SelectItem>
                                <SelectItem value="3">Every 3 hours</SelectItem>
                                <SelectItem value="6">Every 6 hours</SelectItem>
                                <SelectItem value="12">Every 12 hours</SelectItem>
                                <SelectItem value="24">Every 24 hours</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={addDomain.isPending} className="gap-2">
                            {addDomain.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                            Add to Watchlist
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
