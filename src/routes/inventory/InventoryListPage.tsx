import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Chip,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useInventoryItems, useInventoryAlerts, useInventorySummary, type InventoryQuickFilter } from "../../hooks/queries/useInventory";
import { useCreateInventoryItem } from "../../hooks/mutations/useInventoryMutations";
import { useAuth } from "../../auth/AuthContext";
import { Roles } from "../../auth/roles";
import type { CreateInventoryItemRequest } from "../../api/types";
import { QueryState } from "../../components/QueryState";
import LowStockBanner from "./components/LowStockBanner";
import ExpiringSoonBanner from "./components/ExpiringSoonBanner";
import StockStatusChip from "./components/StockStatusChip";
import ExpiryBadge from "./components/ExpiryBadge";
import CategoryTabs from "./components/CategoryTabs";
import ItemFormDialog from "./components/ItemFormDialog";
import AdjustmentsPanel from "./components/AdjustmentsPanel";
import type { InventoryCategory, InventoryItem } from "../../api/types";
import { formatCurrency } from "../../utils/currency";

function nearestExpiry(item: InventoryItem): string | null {
  const dates = item.batches.filter((b) => b.expiryDate != null).map((b) => b.expiryDate as string);
  if (dates.length === 0) return null;
  return dates.reduce((soonest, d) => (d < soonest ? d : soonest));
}

const PAGE_SIZE = 25;

const QUICK_FILTERS: { value: InventoryQuickFilter; label: string }[] = [
  { value: "", label: "Default View" },
  { value: "nearExpiry", label: "Near Expiry" },
  { value: "lowStock", label: "Low Stock" },
  { value: "negativeMargin", label: "Negative Margin" },
];

export default function InventoryListPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const [category, setCategory] = useState<InventoryCategory | "">("");
  const [search, setSearch] = useState("");
  const [quickFilter, setQuickFilter] = useState<InventoryQuickFilter>("");
  const { data, isLoading, error } = useInventoryItems(page * PAGE_SIZE, PAGE_SIZE, category, search, quickFilter);
  const { data: alerts } = useInventoryAlerts();
  const { data: summary } = useInventorySummary();
  const createItem = useCreateInventoryItem();

  const [showNewItem, setShowNewItem] = useState(false);

  function handleCategoryChange(value: InventoryCategory | "") {
    setCategory(value);
    setPage(0);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(0);
  }

  function handleQuickFilterChange(value: InventoryQuickFilter) {
    setQuickFilter(value);
    setPage(0);
  }

  async function handleCreate(values: CreateInventoryItemRequest) {
    await createItem.mutateAsync(values);
    setShowNewItem(false);
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5, flexWrap: "wrap", gap: 1 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Items
        </Typography>
        {user?.roles.includes(Roles.Admin) && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowNewItem(true)}>
            Create Product
          </Button>
        )}
      </Box>

      {summary && (
        <Typography color="text.secondary" sx={{ mb: 2 }}>
          Total Valuation: <strong>{formatCurrency(summary.totalValuation)}</strong>
        </Typography>
      )}

      {alerts && <LowStockBanner items={alerts.lowStock} />}
      {alerts && <ExpiringSoonBanner batches={alerts.expiringSoon} />}

      <ItemFormDialog
        open={showNewItem}
        onClose={() => setShowNewItem(false)}
        title="Create Product"
        submitLabel="Create"
        isSubmitting={createItem.isPending}
        onSubmit={handleCreate}
      />

      <CategoryTabs value={category} onChange={handleCategoryChange} />

      <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: "wrap" }}>
        {QUICK_FILTERS.map((f) => (
          <Chip
            key={f.value}
            label={f.label}
            clickable
            color={quickFilter === f.value ? "primary" : "default"}
            variant={quickFilter === f.value ? "filled" : "outlined"}
            onClick={() => handleQuickFilterChange(f.value)}
          />
        ))}
      </Stack>

      <TextField
        placeholder="Search by name or code…"
        value={search}
        onChange={(e) => handleSearchChange(e.target.value)}
        size="small"
        sx={{ mb: 2, width: { xs: "100%", sm: 320 } }}
      />

      <QueryState isLoading={isLoading} error={error}>
        {data && data.items.length === 0 && <Typography>No inventory items match your filters.</Typography>}
        {data && data.items.length > 0 && (
          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Code</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Exp. Date</TableCell>
                    <TableCell align="right">Margin</TableCell>
                    <TableCell align="right">Average</TableCell>
                    <TableCell align="right">In-Stock</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.sku ?? "—"}</TableCell>
                      <TableCell>
                        <Link component={RouterLink} to={`/inventory/${item.id}`}>
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        <ExpiryBadge expiryDate={nearestExpiry(item)} />
                      </TableCell>
                      <TableCell align="right" sx={item.margin != null && item.margin < 0 ? { color: "error.main" } : undefined}>
                        {item.margin != null ? formatCurrency(item.margin) : "—"}
                      </TableCell>
                      <TableCell align="right">{item.averageCost != null ? formatCurrency(item.averageCost) : "—"}</TableCell>
                      <TableCell align="right" sx={item.currentStock <= item.parLevel ? { color: "error.main", fontWeight: 600 } : undefined}>
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell>
                        <StockStatusChip currentStock={item.currentStock} parLevel={item.parLevel} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={data.totalCount}
              page={page}
              onPageChange={(_, newPage) => setPage(newPage)}
              rowsPerPage={PAGE_SIZE}
              rowsPerPageOptions={[PAGE_SIZE]}
            />
          </Paper>
        )}
      </QueryState>

      <AdjustmentsPanel />
    </Box>
  );
}
