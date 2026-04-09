import axios, { AxiosInstance, AxiosError } from "axios";
import type {
    MiniCRMConfig,
    Contact,
    Project,
    ToDo,
    Invoice,
    ListResponse,
} from "./types.js";

class RateLimiter {
    private timestamps: number[] = [];
    private readonly maxRequests = 60;
    private readonly windowMs = 60_000;

    async throttle(): Promise<void> {
        const now = Date.now();
        this.timestamps = this.timestamps.filter((t) => now - t < this.windowMs);

        if (this.timestamps.length >= this.maxRequests) {
            const oldest = this.timestamps[0];
            const waitMs = this.windowMs - (now - oldest) + 100;
            await new Promise((resolve) => setTimeout(resolve, waitMs));
        }

        this.timestamps.push(Date.now());
    }
}

export class MiniCRMClient {
    private http: AxiosInstance;
    private rateLimiter = new RateLimiter();

    constructor(config: MiniCRMConfig) {
        this.http = axios.create({
            baseURL: config.baseUrl,
            auth: {
                username: config.systemId,
                password: config.apiKey,
            },
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            timeout: 15_000,
        });
    }

    private async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
        await this.rateLimiter.throttle();
        try {
            const res = await this.http.get<T>(path, { params });
            return res.data;
        } catch (err) {
            throw this.formatError(err);
        }
    }

    private async put<T>(path: string, data: unknown): Promise<T> {
        await this.rateLimiter.throttle();
        try {
            const res = await this.http.put<T>(path, data);
            return res.data;
        } catch (err) {
            throw this.formatError(err);
        }
    }

    private async post<T>(path: string, data: unknown): Promise<T> {
        await this.rateLimiter.throttle();
        try {
            const res = await this.http.post<T>(path, data);
            return res.data;
        } catch (err) {
            throw this.formatError(err);
        }
    }

    private formatError(err: unknown): Error {
        if (err instanceof AxiosError) {
            const status = err.response?.status;
            const body = JSON.stringify(err.response?.data ?? {});
            return new Error(`miniCRM API hiba ${status}: ${body}`);
        }
        return err instanceof Error ? err : new Error(String(err));
    }

    // ── CONTACTS ──────────────────────────────────────────────────────────────

    async searchContacts(params: { Name?: string; Email?: string; Phone?: string }): Promise<ListResponse<Contact>> {
        return this.get("/Api/R3/Contact", params);
    }

    async getContact(id: number): Promise<Contact> {
        return this.get(`/Api/R3/Contact/${id}`);
    }

    async createContact(data: Contact): Promise<{ Id: number }> {
        return this.put("/Api/R3/Contact", data);
    }

    async updateContact(id: number, data: Partial<Contact>): Promise<{ Id: number }> {
        return this.put(`/Api/R3/Contact/${id}`, data);
    }

    // ── PROJECTS ──────────────────────────────────────────────────────────────

    async searchProjects(params: { CategoryId?: number; StatusId?: number; ContactId?: number; UserId?: number; Name?: string }): Promise<ListResponse<Project>> {
        return this.get("/Api/R3/Project", params);
    }

    async getProject(id: number): Promise<Project> {
        return this.get(`/Api/R3/Project/${id}`);
    }

    async createProject(data: Project): Promise<{ Id: number }> {
        return this.put("/Api/R3/Project", data);
    }

    async updateProjectStatus(id: number, statusId: number): Promise<{ Id: number }> {
        return this.put(`/Api/R3/Project/${id}`, { StatusId: statusId });
    }

    // ── TODOS ─────────────────────────────────────────────────────────────────

    async createToDo(data: ToDo): Promise<{ Id: number }> {
        return this.post("/Api/R3/ToDo", data);
    }

    async getToDoList(cardId: number): Promise<ListResponse<ToDo>> {
        return this.get(`/Api/R3/ToDoList/${cardId}`);
    }

    // ── INVOICES ──────────────────────────────────────────────────────────────

    async getInvoices(params?: { Page?: number }): Promise<ListResponse<Invoice>> {
        return this.get("/Api/Invoice/List", params);
    }

    async getInvoice(id: number): Promise<Invoice> {
        return this.get(`/Api/Invoice/${id}`);
    }

    // ── SCHEMA ────────────────────────────────────────────────────────────────

    async getCategories(): Promise<unknown> {
        return this.get("/Api/R3/Category");
    }

    async getSchema(type: string): Promise<unknown> {
        return this.get(`/Api/R3/Schema/${type}`);
    }
}