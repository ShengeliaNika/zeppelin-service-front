import { useState, type FormEvent } from "react";
import { Box, Button, Card, CardContent, List, ListItem, TextField, Typography } from "@mui/material";
import type { TreatmentPlanItemStatus } from "../../../api/types";
import { useTreatmentPlans } from "../../../hooks/queries/useClinical";
import { useCreateTreatmentPlan, useUpdateTreatmentPlanItem } from "../../../hooks/mutations/useClinicalMutations";
import { StatusChip } from "../../../components/StatusChip";

const NEXT_ITEM_STATUS: Partial<Record<TreatmentPlanItemStatus, TreatmentPlanItemStatus>> = {
  Planned: "InProgress",
  InProgress: "Done",
};

export default function TreatmentPlanPanel({ patientId }: { patientId: string }) {
  const { data: plans, isLoading } = useTreatmentPlans(patientId);
  const createPlan = useCreateTreatmentPlan(patientId);
  const updateItem = useUpdateTreatmentPlanItem(patientId);

  const [title, setTitle] = useState("");
  const [itemDescription, setItemDescription] = useState("");
  const [showNewPlan, setShowNewPlan] = useState(false);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await createPlan.mutateAsync({
      title,
      items: itemDescription ? [{ description: itemDescription }] : [],
    });
    setTitle("");
    setItemDescription("");
    setShowNewPlan(false);
  }

  function advanceItem(itemId: string, current: TreatmentPlanItemStatus) {
    const next = NEXT_ITEM_STATUS[current];
    if (next) {
      updateItem.mutate({ itemId, request: { status: next } });
    }
  }

  return (
    <Box>
      {isLoading && <Typography>Loading…</Typography>}
      {plans && plans.length === 0 && !showNewPlan && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          No treatment plans yet.
        </Typography>
      )}

      {plans?.map((plan) => (
        <Card key={plan.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="subtitle1">{plan.title}</Typography>
              <StatusChip status={plan.status} />
            </Box>
            <List dense disablePadding>
              {plan.items.map((item) => (
                <ListItem
                  key={item.id}
                  disableGutters
                  sx={{
                    justifyContent: "space-between",
                    textDecoration: item.status === "Done" ? "line-through" : "none",
                    color: item.status === "Done" ? "text.secondary" : "text.primary",
                  }}
                >
                  <Typography variant="body2">
                    {item.description}
                    {item.toothNumber ? ` (tooth ${item.toothNumber})` : ""}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <StatusChip status={item.status} />
                    {NEXT_ITEM_STATUS[item.status] && (
                      <Button size="small" onClick={() => advanceItem(item.id, item.status)} disabled={updateItem.isPending}>
                        Mark {NEXT_ITEM_STATUS[item.status]}
                      </Button>
                    )}
                  </Box>
                </ListItem>
              ))}
            </List>
          </CardContent>
        </Card>
      ))}

      {showNewPlan ? (
        <Box component="form" onSubmit={handleCreate} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <TextField size="small" placeholder="Plan title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextField
            size="small"
            placeholder="First item description (optional)"
            value={itemDescription}
            onChange={(e) => setItemDescription(e.target.value)}
          />
          <Button onClick={() => setShowNewPlan(false)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createPlan.isPending}>
            {createPlan.isPending ? "Creating…" : "Create Plan"}
          </Button>
        </Box>
      ) : (
        <Button variant="outlined" onClick={() => setShowNewPlan(true)}>
          + New Treatment Plan
        </Button>
      )}
    </Box>
  );
}
