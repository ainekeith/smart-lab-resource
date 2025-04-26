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
      return format(parsedDate, "yyyy-MM-dd'T'HH:mm:ss'Z'");
    } catch {
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
    } catch (err: unknown) {
      throw new Error(
        "Error formatting parameters: " +
          (err instanceof Error ? err.message : "Unknown error")
      );
    }
  }

  async getAll(filters?: BookingFilters): Promise<PaginatedResponse<Booking>> {
    try {
      const params = this.formatParams(filters);
      console.log("[BookingService][GET] /bookings/ params:", params);
      const response = await api.get<PaginatedResponse<Booking>>("/bookings/", {
        params,
        paramsSerializer: {
          encode: (param: string) => param,
        },
      });
      console.log("[BookingService][GET] /bookings/ response:", response.data);
      if (!response.data.results && Array.isArray(response.data)) {
        return {
          count: response.data.length,
          next: null,
          previous: null,
          results: response.data,
        };
      }
      return response.data;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Invalid date")) {
        throw new Error("Please provide valid dates for filtering bookings");
      }
      throw err;
    }
  }

  async getById(id: number): Promise<Booking> {
    try {
      console.log(`[BookingService][GET] /bookings/${id}/`);
      const response = await api.get<Booking>(`/bookings/${id}/`);
      console.log(
        `[BookingService][GET] /bookings/${id}/ response:`,
        response.data
      );
      return response.data;
    } catch {
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
      console.log("[BookingService][POST] /bookings/ payload:", formattedData);
      const response = await api.post<Booking>("/bookings/", formattedData);
      console.log("[BookingService][POST] /bookings/ response:", response.data);
      return response.data;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Invalid date")) {
        throw new Error("Please provide valid start and end times");
      }
      throw err;
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
      console.log(
        `[BookingService][PUT] /bookings/${id}/ payload:`,
        formattedData
      );
      const response = await api.put<Booking>(
        `/bookings/${id}/`,
        formattedData
      );
      console.log(
        `[BookingService][PUT] /bookings/${id}/ response:`,
        response.data
      );
      return response.data;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Invalid date")) {
        throw new Error("Please provide valid start and end times");
      }
      throw err;
    }
  }

  async approve(id: number): Promise<Booking> {
    try {
      console.log(`[BookingService][POST] /bookings/${id}/approve/`);
      const response = await api.post<Booking>(`/bookings/${id}/approve/`);
      console.log(
        `[BookingService][POST] /bookings/${id}/approve/ response:`,
        response.data
      );
      return response.data;
    } catch {
      throw new Error("Failed to approve booking");
    }
  }

  async reject(id: number, reason: string): Promise<Booking> {
    try {
      console.log(`[BookingService][POST] /bookings/${id}/reject/ payload:`, {
        reason,
      });
      const response = await api.post<Booking>(`/bookings/${id}/reject/`, {
        reason,
      });
      console.log(
        `[BookingService][POST] /bookings/${id}/reject/ response:`,
        response.data
      );
      return response.data;
    } catch {
      throw new Error("Failed to reject booking");
    }
  }

  async cancel(id: number): Promise<Booking> {
    try {
      console.log(`[BookingService][POST] /bookings/${id}/cancel/`);
      const response = await api.post<Booking>(`/bookings/${id}/cancel/`);
      console.log(
        `[BookingService][POST] /bookings/${id}/cancel/ response:`,
        response.data
      );
      return response.data;
    } catch {
      throw new Error("Failed to cancel booking");
    }
  }

  async checkAvailability(
    equipmentId: number,
    startTime: string | Date,
    endTime: string | Date
  ): Promise<boolean> {
    try {
      const params = {
        equipment_id: equipmentId,
        start_time: this.formatDate(startTime),
        end_time: this.formatDate(endTime),
      };
      console.log(
        "[BookingService][GET] /bookings/check-availability/ params:",
        params
      );
      const response = await api.get("/bookings/check-availability/", {
        params,
      });
      console.log(
        "[BookingService][GET] /bookings/check-availability/ response:",
        response.data
      );
      return response.data.available;
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("Invalid date")) {
        throw new Error("Please provide valid start and end times");
      }
      throw new Error("Failed to check availability");
    }
  }
}

export const bookingService = new BookingService();
export default bookingService;
