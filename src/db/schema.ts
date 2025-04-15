import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import {
  boolean,
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  json,
  uuid,
  varchar,
  jsonb,
} from "drizzle-orm/pg-core"
import type { AdapterAccountType } from "next-auth/adapters"
import { CanvasData } from "@/types/canvas";

export const users = pgTable("user", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  password: text("password"), 
});

export const usersRelations = relations(users, ({ many }) => ({
  projects: many(projects),
  canvasProjects: many(canvasProjects),
}));

export const accounts = pgTable(
  "account",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccountType>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
)

export const sessions = pgTable("session", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
})

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
)

export const authenticators = pgTable(
  "authenticator",
  {
    credentialID: text("credentialID").notNull().unique(),
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    providerAccountId: text("providerAccountId").notNull(),
    credentialPublicKey: text("credentialPublicKey").notNull(),
    counter: integer("counter").notNull(),
    credentialDeviceType: text("credentialDeviceType").notNull(),
    credentialBackedUp: boolean("credentialBackedUp").notNull(),
    transports: text("transports"),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
)

export const projects = pgTable("project", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade",
    }),
  json: text("json").notNull(),
  height: integer("height").notNull(),
  width: integer("width").notNull(),
  thumbnailUrl: text("thumbnailUrl"),
  isTemplate: boolean("isTemplate"),
  isPro: boolean("isPro"),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const projectsRelations = relations(projects, ({ one }) => ({
  user: one(users, {
    fields: [projects.userId],
    references: [users.id],
  }),
}));

export const projectsInsertSchema = createInsertSchema(projects);

export const canvasProjects = pgTable("canvas_projects", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  userId: text("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  canvasData: jsonb("canvas_data").$type<CanvasData>().notNull().default({
    version: "1.0",
    pages: [],
    currentPage: 0,
    complete_doors_and_windows: [],
    single_doors: [],
    double_doors: [],
    windows: [],
    single_doors_and_windows: [],
    single_doors_and_double_doors: [],
    double_doors_and_windows: [],
    wall_color_processing: [], // Walls Detection feature
    room_area_processing: [], // Room Area Detection feature
    room_n_processing: [], // Room Number Detection feature
    exclusion_Zones_processing: [], // Inclusive/Exclusive Zones Detection feature
    fire_alarm_processing: [] // Fire Alarm Detection feature
  } as CanvasData),
});

export const canvasProjectsRelations = relations(canvasProjects, ({ one }) => ({
  user: one(users, {
    fields: [canvasProjects.userId],
    references: [users.id],
  }),
}));

export const canvasProjectsInsertSchema = createInsertSchema(canvasProjects);

export const subscriptions = pgTable("subscription", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text("userId")
    .notNull()
    .references(() => users.id, {
      onDelete: "cascade"
    }),
  subscriptionId: text("subscriptionId").notNull(),
  customerId: text("customerId").notNull(),
  priceId: text("priceId").notNull(),
  status: text("status").notNull(),
  currentPeriodEnd: timestamp("currentPeriodEnd", { mode: "date" }),
  createdAt: timestamp("createdAt", { mode: "date" }).notNull(),
  updatedAt: timestamp("updatedAt", { mode: "date" }).notNull(),
});

export const takeoffs = pgTable("takeoffs", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  quoteNumber: varchar("quote_number", { length: 50 }).notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull(),
  invoiceNumber: varchar("invoice_number", { length: 50 }).notNull(),
  clientName: varchar("client_name", { length: 255 }).notNull(),
  clientEmail: varchar("client_email", { length: 255 }).notNull(),
  status: varchar("status", { length: 50 }).notNull().default("Pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const calendarEvents = pgTable("calendar_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  allDay: boolean("all_day").default(false),
  location: text("location"),
  color: varchar("color", { length: 7 }).default("#FF5F1F"), 
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  userId: text("user_id").notNull(),
  recurring: jsonb("recurring").default({
    type: "none",
    interval: 1,
    until: null,
  }),
  reminderMinutes: integer("reminder_minutes"), 
  status: varchar("status", { length: 20 }).default("confirmed"), 
});
