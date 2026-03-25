"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

type ApproveReservationButtonProps = {
  reservationId: string;
  organizationId: string;
  status: string;
};

export function ApproveReservationButton({
  reservationId,
  organizationId,
  status
}: ApproveReservationButtonProps): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onApprove = async () => {
    setLoading(true);
    try {
      await fetch(`/api/admin/reservations/${reservationId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId })
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      type="button"
      variant={status === "confirmed" ? "secondary" : "accent"}
      onClick={onApprove}
      disabled={loading || status === "confirmed"}
      size="sm"
    >
      {status === "confirmed" ? "Aprobada" : loading ? "Aprobando..." : "Aprobar pago"}
    </Button>
  );
}
