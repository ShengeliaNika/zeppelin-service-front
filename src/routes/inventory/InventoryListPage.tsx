import { useState, type FormEvent } from "react";
import { Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Link,
  MenuItem,
  Paper,
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
import { useInventoryItems, useInventoryAlerts } from "../../hooks/queries/useInventory";
import { useCreateInventoryItem } from "../../hooks/mutations/useInventoryMutations";
import { useAuth } from "../../auth/AuthContext";
import { Roles } from "../../auth/roles";
import type { InventoryCategory } from "../../api/types";
import { QueryState } from "../../components/QueryState";
import LowStockBanner from "./components/LowStockBanner";
import ExpiringSoonBanner from "./components/ExpiringSoonBanner";

const CATEGORIES: InventoryCategory[] = ["Consumable", "Anesthetic", "Ppe", "Instrument", "Other"];
const PAGE_SIZE = 25;

export default function InventoryListPage() {
  const { user } = useAuth();
  const [page, setPage] = useState(0);
  const { data, isLoading, error } = useInventoryItems(page * PAGE_SIZE, PAGE_SIZE);
  const { data: alerts } = useInventoryAlerts();
  const createItem = useCreateInventoryItem();

  const [showNewItem, setShowNewItem] = useState(false);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<InventoryCategory>("Consumable");
  const [unit, setUnit] = useState("");
  const [parLevel, setParLevel] = useState("");

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    await createItem.mutateAsync({ name, category, unit, parLevel: Number(parLevel) });
    setName("");
    setUnit("");
    setParLevel("");
    setShowNewItem(false);
  }

  return (
    <Box>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          Inventory
        </Typography>
        {user?.roles.includes(Roles.Admin) && !showNewItem && (
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setShowNewItem(true)}>
            New Item
          </Button>
        )}
      </Box>

      {alerts && <LowStockBanner items={alerts.lowStock} />}
      {alerts && <ExpiringSoonBanner batches={alerts.expiringSoon} />}

      {showNewItem && (
        <Box component="form" onSubmit={handleCreate} sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mb: 2 }}>
          <TextField size="small" label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <TextField select size="small" label="Category" value={category} onChange={(e) => setCategory(e.target.value as InventoryCategory)} sx={{ minWidth: 140 }}>
            {CATEGORIES.map((c) => (
              <MenuItem key={c} value={c}>
                {c}
              </MenuItem>
            ))}
          </TextField>
          <TextField size="small" label="Unit (e.g. box)" value={unit} onChange={(e) => setUnit(e.target.value)} required />
          <TextField
            type="number"
            size="small"
            label="Par level"
            slotProps={{ htmlInput: { min: 0 } }}
            value={parLevel}
            onChange={(e) => setParLevel(e.target.value)}
            required
          />
          <Button onClick={() => setShowNewItem(false)}>Cancel</Button>
          <Button type="submit" variant="contained" disabled={createItem.isPending}>
            {createItem.isPending ? "Creating…" : "Create"}
          </Button>
        </Box>
      )}

      <QueryState isLoading={isLoading} error={error}>
        {data && data.items.length === 0 && <Typography>No inventory items yet.</Typography>}
        {data && data.items.length > 0 && (
          <Paper variant="outlined">
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Stock</TableCell>
                    <TableCell>Par Level</TableCell>
                    <TableCell>Supplier</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map((item) => (
                    <TableRow
                      key={item.id}
                      hover
                      sx={item.currentStock <= item.parLevel ? { bgcolor: (t) => `${t.palette.error.main}14` } : undefined}
                    >
                      <TableCell>
                        <Link component={RouterLink} to={`/inventory/${item.id}`}>
                          {item.name}
                        </Link>
                      </TableCell>
                      <TableCell>{item.category}</TableCell>
                      <TableCell>
                        {item.currentStock} {item.unit}
                      </TableCell>
                      <TableCell>
                        {item.parLevel} {item.unit}
                      </TableCell>
                      <TableCell>{item.supplierName ?? "—"}</TableCell>
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
    </Box>
  );
}
