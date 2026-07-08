import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Box, Button, Link, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useAdjustments } from "../../../hooks/queries/useInventory";
import CreateAdjustmentDialog from "./CreateAdjustmentDialog";

export default function AdjustmentsPanel() {
  const { data: adjustments } = useAdjustments(20);
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6">Adjustments</Typography>
        <Button size="small" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
          Create Adjustment
        </Button>
      </Box>

      {!adjustments || adjustments.length === 0 ? (
        <Typography color="text.secondary">No adjustments logged yet.</Typography>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Product</TableCell>
                  <TableCell align="right">New stock</TableCell>
                  <TableCell>Note</TableCell>
                  <TableCell>By</TableCell>
                  <TableCell>When</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {adjustments.map((a) => (
                  <TableRow key={a.id} hover>
                    <TableCell>
                      <Link component={RouterLink} to={`/inventory/${a.inventoryItemId}`}>
                        {a.inventoryItemName}
                      </Link>
                    </TableCell>
                    <TableCell align="right">
                      {a.newQuantity} {a.unit}
                    </TableCell>
                    <TableCell>{a.notes ?? "—"}</TableCell>
                    <TableCell>{a.recordedByName}</TableCell>
                    <TableCell>{new Date(a.recordedAtUtc).toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <CreateAdjustmentDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
}
