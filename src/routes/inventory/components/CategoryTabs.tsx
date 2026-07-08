import { Tab, Tabs } from "@mui/material";
import type { InventoryCategory } from "../../../api/types";

const CATEGORIES: InventoryCategory[] = ["Consumable", "Anesthetic", "Ppe", "Instrument", "Other"];

export default function CategoryTabs({
  value,
  onChange,
}: {
  value: InventoryCategory | "";
  onChange: (category: InventoryCategory | "") => void;
}) {
  return (
    <Tabs
      value={value}
      onChange={(_, v) => onChange(v)}
      variant="scrollable"
      scrollButtons="auto"
      sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}
    >
      <Tab label="All" value="" />
      {CATEGORIES.map((c) => (
        <Tab key={c} label={c} value={c} />
      ))}
    </Tabs>
  );
}
