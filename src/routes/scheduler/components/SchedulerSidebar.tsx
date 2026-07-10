import { useEffect, useState } from "react";
import { Box, Checkbox, IconButton, InputAdornment, List, ListItem, Paper, TextField, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import SearchIcon from "@mui/icons-material/Search";
import type { StaffDirectoryEntry } from "../../../api/types";

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

// Fixed 6-week (42-cell) grid, Sunday-first - matches the day-column order
// already used by the main week view in SchedulerCalendar.tsx - and keeps a
// stable height across months instead of jumping between 5 and 6 rows.
function buildMonthGrid(viewMonth: Date): (Date | null)[] {
  const firstDay = startOfMonth(viewMonth);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), d));
  while (cells.length < 42) cells.push(null);
  return cells;
}

interface Props {
  staff: StaffDirectoryEntry[];
  colorByDentist: Map<string, string>;
  visibleDentistIds: Set<string>;
  onToggleDentist: (id: string) => void;
  focusedDate: Date;
  onDateSelect: (date: Date) => void;
}

export default function SchedulerSidebar({ staff, colorByDentist, visibleDentistIds, onToggleDentist, focusedDate, onDateSelect }: Props) {
  const [viewMonth, setViewMonth] = useState(() => startOfMonth(focusedDate));
  const [search, setSearch] = useState("");

  // Follows the main calendar's navigation (Today/prev/next in the week grid)
  // to a different month, but doesn't fight the user browsing the mini
  // calendar's own prev/next month buttons without picking a date yet.
  useEffect(() => {
    setViewMonth((prev) =>
      prev.getFullYear() === focusedDate.getFullYear() && prev.getMonth() === focusedDate.getMonth() ? prev : startOfMonth(focusedDate),
    );
  }, [focusedDate]);

  const today = new Date();
  const grid = buildMonthGrid(viewMonth);

  const filteredStaff = staff.filter((s) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return `${s.firstName} ${s.lastName}`.toLowerCase().includes(q);
  });

  function goPrevMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function goNextMonth() {
    setViewMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  return (
    <Paper variant="outlined" sx={{ p: 2, width: "100%" }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          {viewMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" })}
        </Typography>
        <Box>
          <IconButton size="small" onClick={goPrevMonth} aria-label="Previous month">
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" onClick={goNextMonth} aria-label="Next month">
            <ChevronRightIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.25, mb: 0.5 }}>
        {WEEKDAY_LABELS.map((label, i) => (
          <Typography key={i} variant="caption" color="text.secondary" sx={{ textAlign: "center" }}>
            {label}
          </Typography>
        ))}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 0.25, mb: 2.5 }}>
        {grid.map((date, i) => {
          if (!date) return <Box key={i} />;
          const isToday = isSameDay(date, today);
          const isSelected = isSameDay(date, focusedDate);
          return (
            <Box
              key={i}
              component="button"
              type="button"
              onClick={() => onDateSelect(date)}
              sx={{
                border: "none",
                borderRadius: "50%",
                aspectRatio: "1 / 1",
                cursor: "pointer",
                fontSize: "0.75rem",
                fontFamily: "inherit",
                bgcolor: isSelected ? "primary.main" : isToday ? "action.selected" : "transparent",
                color: isSelected ? "primary.contrastText" : "text.primary",
                "&:hover": { bgcolor: isSelected ? "primary.main" : "action.hover" },
              }}
            >
              {date.getDate()}
            </Box>
          );
        })}
      </Box>

      <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
        Dentists
      </Typography>
      <TextField
        size="small"
        fullWidth
        placeholder="Search dentists…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 1 }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
              </InputAdornment>
            ),
          },
        }}
      />
      <List dense disablePadding>
        {filteredStaff.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ py: 0.5 }}>
            No dentists found.
          </Typography>
        ) : (
          filteredStaff.map((s) => (
            <ListItem key={s.id} disableGutters disablePadding sx={{ py: 0.25 }}>
              <Checkbox
                size="small"
                checked={visibleDentistIds.has(s.id)}
                onChange={() => onToggleDentist(s.id)}
                sx={{
                  p: 0.5,
                  mr: 0.5,
                  color: colorByDentist.get(s.id),
                  "&.Mui-checked": { color: colorByDentist.get(s.id) },
                }}
              />
              <Typography variant="body2">
                {s.firstName} {s.lastName}
              </Typography>
            </ListItem>
          ))
        )}
      </List>
    </Paper>
  );
}
