import { 
  Topic, InsertTopic, 
  SearchHistory, InsertSearchHistory,
  Report, InsertReport,
  Preference, InsertPreference
} from "@shared/schema";

export interface IStorage {
  // Topics
  getTopic(id: number): Promise<Topic | undefined>;
  getTopics(): Promise<Topic[]>;
  getTopicsByCategory(category: string): Promise<Topic[]>;
  createTopic(topic: InsertTopic): Promise<Topic>;
  updateTopic(id: number, topic: Partial<InsertTopic>): Promise<Topic | undefined>;
  deleteTopic(id: number): Promise<boolean>;
  bookmarkTopic(id: number): Promise<Topic | undefined>;

  // Search History
  getSearchHistory(): Promise<SearchHistory[]>;
  getSearchHistoryByQuery(query: string): Promise<SearchHistory | undefined>;
  createSearchHistory(searchHistory: InsertSearchHistory): Promise<SearchHistory>;
  deleteSearchHistory(id: number): Promise<boolean>;
  clearSearchHistory(): Promise<boolean>;

  // Reports
  getReport(id: number): Promise<Report | undefined>;
  getReportsByTopicId(topicId: number): Promise<Report[]>;
  createReport(report: InsertReport): Promise<Report>;
  deleteReport(id: number): Promise<boolean>;

  // Preferences
  getPreferences(): Promise<Preference | undefined>;
  updatePreferences(preferences: Partial<InsertPreference>): Promise<Preference>;
}

export class MemStorage implements IStorage {
  private topics: Map<number, Topic>;
  private searchHistory: Map<number, SearchHistory>;
  private reports: Map<number, Report>;
  private preferences: Preference | undefined;
  
  private topicId: number;
  private searchHistoryId: number;
  private reportId: number;
  private preferencesId: number;

  constructor() {
    this.topics = new Map();
    this.searchHistory = new Map();
    this.reports = new Map();
    
    this.topicId = 1;
    this.searchHistoryId = 1;
    this.reportId = 1;
    this.preferencesId = 1;

    // Set default preferences
    this.preferences = {
      id: this.preferencesId,
      theme: "dark",
      fontSize: "medium",
      language: "english"
    };
  }

  // Topics
  async getTopic(id: number): Promise<Topic | undefined> {
    return this.topics.get(id);
  }

  async getTopics(): Promise<Topic[]> {
    return Array.from(this.topics.values());
  }

  async getTopicsByCategory(category: string): Promise<Topic[]> {
    return Array.from(this.topics.values()).filter(
      (topic) => topic.category === category
    );
  }

  async createTopic(insertTopic: InsertTopic): Promise<Topic> {
    const id = this.topicId++;
    const now = new Date();
    const topic: Topic = { ...insertTopic, id, createdAt: now };
    this.topics.set(id, topic);
    return topic;
  }

  async updateTopic(id: number, topicUpdate: Partial<InsertTopic>): Promise<Topic | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;

    const updatedTopic: Topic = { ...topic, ...topicUpdate };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }

  async deleteTopic(id: number): Promise<boolean> {
    return this.topics.delete(id);
  }

  async bookmarkTopic(id: number): Promise<Topic | undefined> {
    const topic = this.topics.get(id);
    if (!topic) return undefined;

    const updatedTopic: Topic = { ...topic, isBookmarked: !topic.isBookmarked };
    this.topics.set(id, updatedTopic);
    return updatedTopic;
  }

  // Search History
  async getSearchHistory(): Promise<SearchHistory[]> {
    return Array.from(this.searchHistory.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getSearchHistoryByQuery(query: string): Promise<SearchHistory | undefined> {
    return Array.from(this.searchHistory.values()).find(
      (history) => history.query === query
    );
  }

  async createSearchHistory(insertSearchHistory: InsertSearchHistory): Promise<SearchHistory> {
    const id = this.searchHistoryId++;
    const now = new Date();
    const searchHistory: SearchHistory = { ...insertSearchHistory, id, createdAt: now };
    this.searchHistory.set(id, searchHistory);
    return searchHistory;
  }

  async deleteSearchHistory(id: number): Promise<boolean> {
    return this.searchHistory.delete(id);
  }

  async clearSearchHistory(): Promise<boolean> {
    this.searchHistory.clear();
    return true;
  }

  // Reports
  async getReport(id: number): Promise<Report | undefined> {
    return this.reports.get(id);
  }

  async getReportsByTopicId(topicId: number): Promise<Report[]> {
    return Array.from(this.reports.values()).filter(
      (report) => report.topicId === topicId
    );
  }

  async createReport(insertReport: InsertReport): Promise<Report> {
    const id = this.reportId++;
    const now = new Date();
    const report: Report = { ...insertReport, id, createdAt: now };
    this.reports.set(id, report);
    return report;
  }

  async deleteReport(id: number): Promise<boolean> {
    return this.reports.delete(id);
  }

  // Preferences
  async getPreferences(): Promise<Preference | undefined> {
    return this.preferences;
  }

  async updatePreferences(preferencesUpdate: Partial<InsertPreference>): Promise<Preference> {
    if (!this.preferences) {
      const id = this.preferencesId;
      this.preferences = {
        id,
        theme: preferencesUpdate.theme || "dark",
        fontSize: preferencesUpdate.fontSize || "medium",
        language: preferencesUpdate.language || "english"
      };
    } else {
      this.preferences = { ...this.preferences, ...preferencesUpdate };
    }
    return this.preferences;
  }
}

export const storage = new MemStorage();
