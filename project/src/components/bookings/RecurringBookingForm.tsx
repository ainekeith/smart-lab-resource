import { useState } from 'react';
import {
  Box,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  Select,
  MenuItem,
  Checkbox,
  Button,
  Stack,
  Alert,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { addWeeks, addMonths } from 'date-fns';

interface RecurringBookingFormProps {
  onSubmit: (recurringOptions: any) => void;
}

const RecurringBookingForm = ({ onSubmit }: RecurringBookingFormProps) => {
  const [recurrenceType, setRecurrenceType] = useState('weekly');
  const [interval, setInterval] = useState(1);
  const [endDate, setEndDate] = useState<Date | null>(addMonths(new Date(), 1));
  const [weekdays, setWeekdays] = useState<number[]>([]);

  const handleWeekdayToggle = (day: number) => {
    setWeekdays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      recurrenceType,
      interval,
      endDate,
      weekdays: recurrenceType === 'weekly' ? weekdays : undefined,
    });
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Typography variant="h6" gutterBottom>
        Recurring Booking Options
      </Typography>

      <Stack spacing={3}>
        <FormControl>
          <RadioGroup
            value={recurrenceType}
            onChange={(e) => setRecurrenceType(e.target.value)}
          >
            <FormControlLabel
              value="daily"
              control={<Radio />}
              label="Daily"
            />
            <FormControlLabel
              value="weekly"
              control={<Radio />}
              label="Weekly"
            />
          </RadioGroup>
        </FormControl>

        <FormControl fullWidth>
          <Typography variant="subtitle2" gutterBottom>
            Repeat every
          </Typography>
          <Select
            value={interval}
            onChange={(e) => setInterval(Number(e.target.value))}
          >
            {[1, 2, 3, 4].map((num) => (
              <MenuItem key={num} value={num}>
                {num} {recurrenceType === 'weekly' ? 'week(s)' : 'day(s)'}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {recurrenceType === 'weekly' && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Repeat on
            </Typography>
            <Stack direction="row" spacing={1}>
              {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={weekdays.includes(index)}
                      onChange={() => handleWeekdayToggle(index)}
                    />
                  }
                  label={day}
                />
              ))}
            </Stack>
          </Box>
        )}

        <FormControl fullWidth>
          <Typography variant="subtitle2" gutterBottom>
            End Date
          </Typography>
          <DatePicker
            value={endDate}
            onChange={(newValue) => setEndDate(newValue)}
            minDate={addWeeks(new Date(), 1)}
            maxDate={addMonths(new Date(), 3)}
          />
        </FormControl>

        {recurrenceType === 'weekly' && weekdays.length === 0 && (
          <Alert severity="warning">
            Please select at least one day of the week
          </Alert>
        )}

        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={recurrenceType === 'weekly' && weekdays.length === 0}
        >
          Apply Recurring Schedule
        </Button>
      </Stack>
    </Box>
  );
};