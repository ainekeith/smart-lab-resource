import api from "./api";
import {
  Booking,
  BookingRequest,
  BookingFilters,
  PaginatedResponse,
} from "../types";
import { format, parseISO, isValid } from "date-fns";

class BookingService {
  private formatDate(date: Date | string | undefined): string | undefined {
    if (!date) return undefined;

    try {
      const parsedDate = typeof date === "string" ? parseISO(date) : date;
      if (!isValid(parsedDate)) {
        throw new Error("Invalid date");
      }
      // Format date to match Django's expected format
      return format(parsedDate, "yyyy-MM-dd HH:mm:ss");
    } catch (error) {
      throw new Error("Invalid date format");
    }
  }

  private formatParams(params: BookingFilters = {}): Record<string, any> {
    const formattedParams: Record<string, any> = {};

    try {
      if (params.start_date) {
        formattedParams.start_date = this.formatDate(params.start_date);
      }
      if (params.end_date) {
        formattedParams.end_date = this.formatDate(params.end_date);
      }
      if (params.status) {
        formattedParams.status = params.status;
      }
      if (params.equipment_id) {
        formattedParams.equipment_id = params.equipment_id;
      }
      if (params.page) {
        formattedParams.page = params.page;
      }
      if (params.page_size) {
        formattedParams.page_size = params.page_size;
      }

      return formattedParams;
    } catch (error) {
      throw new Error(
        "Error formatting parameters: " + (error as Error).message
      );
    }
  }

  async getAll(filters?: BookingFilters): Promise<PaginatedResponse<Booking>> {
    try {
      const params = {
        ...filters,
        start_date: filters?.start_date
          ? this.formatDate(filters.start_date)
          : undefined,
        end_date: filters?.end_date
          ? this.formatDate(filters.end_date)
          : undefined,
      };

      const response = await api.get<PaginatedResponse<Booking>>("/bookings/", {
        params,
        paramsSerializer: {
          encode: (param: string) => param,
        },
      });
      return response.data;
    } catch (error: any) {
      console.error("Error fetching bookings:", error.response?.data || error);
      throw error;
    }
  }

  async getById(id: number): Promise<Booking> {
    try {
      const response = await api.get<Booking>(`/bookings/${id}/`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch booking details");
    }
  }

  async create(bookingData: BookingRequest): Promise<Booking> {
    try {
      const formattedData = {
        ...bookingData,
        start_time: this.formatDate(bookingData.start_time),
        end_time: this.formatDate(bookingData.end_time),
      };

      const response = await api.post<Booking>("/bookings/", formattedData);
      return response.data;
    } catch (error: any) {
      if (error.message.includes("Invalid date")) {
        throw new Error("Please provide valid start and end times");
      }
      throw error;
    }
  }

  async update(
    id: number,
    bookingData: Partial<BookingRequest>
  ): Promise<Booking> {
    try {
      const formattedData = {
        ...bookingData,
        start_time: bookingData.start_time
          ? this.formatDate(bookingData.start_time)
          : undefined,
        end_time: bookingData.end_time
          ? this.formatDate(bookingData.end_time)
          : undefined,
      };

      const response = await api.put<Booking>(
        `/bookings/${id}/`,
        formattedData
      );
      return response.data;
    } catch (error: any) {
      if (error.message.includes("Invalid date")) {
        throw new Error("Please provide valid start and end times");
      }
      throw error;
    }
  }

  async approve(id: number): Promise<Booking> {
    try {
      const response = await api.post<Booking>(`/bookings/${id}/approve/`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to approve booking");
    }
  }

  async reject(id: number, reason: string): Promise<Booking> {
    try {
      const response = await api.post<Booking>(`/bookings/${id}/reject/`, {
        reason,
      });
      return response.data;
    } catch (error) {
      throw new Error("Failed to reject booking");
    }
  }

  async cancel(id: number): Promise<Booking> {
    try {
      const response = await api.post<Booking>(`/bookings/${id}/cancel/`);
      return response.data;
    } catch (error) {
      throw new Error("Failed to cancel booking");
    }
  }

  async checkAvailability(
    equipmentId: number,
    startTime: string | Date,
    endTime: string | Date
  ): Promise<boolean> {
    try {
      const response = await api.get("/bookings/check-availability/", {
        params: {
          equipment_id: equipmentId,
          start_time: this.formatDate(startTime),
          end_time: this.formatDate(endTime),
        },
      });
      return response.data.available;
    } catch (error: any) {
      if (error.message.includes("Invalid date")) {
        throw new Error("Please provide valid start and end times");
      }
      throw new Error("Failed to check availability");
    }
  }
}

export const bookingService = new BookingService();
export default bookingService;
