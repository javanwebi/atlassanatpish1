import { test } from "node:test";
import assert from "node:assert/strict";
import {
  portalContentService as cms,
  type PortalBannerItem,
} from "../src/services/portalContentService";
import type { Customer } from "../src/types";
const cache = new Map<string, string>();
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: (key: string) => cache.get(key) ?? null,
    setItem: (key: string, value: string) => cache.set(key, value),
  },
});
Object.defineProperty(globalThis, "window", { value: new EventTarget() });
const user = {
  id: "one",
  fullName: "Test",
  phone: "09121111111",
  role: "retail",
  approvedB2B: false,
} as Customer;
const banner = (
  id: string,
  extra: Partial<PortalBannerItem> = {},
): PortalBannerItem => ({
  id,
  portal: "consumer",
  scope: "collective",
  title: "Test",
  subtitle: "",
  badgeText: "",
  ctaText: "",
  ctaLinkOrTab: "orders",
  theme: "industrial_orange",
  minCartVolume: 1000,
  cartDiscountPercent: 5,
  active: true,
  createdAt: "",
  ...extra,
});
test("portal content and campaign rules", async (t) => {
  await t.test("role or price code alone cannot grant the CRM portal", () => {
    assert.equal(
      cms.isHighVolumeCustomer({
        ...user,
        role: "dealer",
        assignedPriceListCode: "A",
        isLegacyCustomer: true,
      }),
      false,
    );
    assert.equal(
      cms.isHighVolumeCustomer({ ...user, approvedB2B: true }),
      true,
    );
  });
  await t.test(
    "club milestones are independent and old wholesale data is preserved",
    () => {
      const key = "atlas_portal_club_milestones_v1";
      const legacy = cms.getClubMilestones("high_volume");
      localStorage.setItem(key, JSON.stringify(legacy));
      assert.notDeepEqual(cms.getClubMilestones("consumer"), legacy);
      const consumer = cms
        .getClubMilestones("consumer")
        .map((m) => ({ ...m, minPurchaseVolume: m.minPurchaseVolume + 123 }));
      cms.saveClubMilestones(consumer, "consumer");
      assert.deepEqual(cms.getClubMilestones("high_volume"), legacy);
      assert.deepEqual(cms.getClubMilestones("consumer"), consumer);
      cms.saveClubMilestones([], "consumer");
      assert.deepEqual(cms.getClubMilestones("consumer"), []);
      assert.deepEqual(cms.getClubMilestones("high_volume"), legacy);
    },
  );
  await t.test(
    "appearance can be overridden without affecting another customer",
    () => {
      cms.saveCustomerOverride({
        customerId: "visual-test",
        customerName: "Test",
        portal: "consumer",
        appearanceOverride: { glass: "solid", density: "compact" },
        updatedAt: "",
      });
      assert.equal(
        cms.getResolvedConfigForCustomer("consumer", "visual-test").appearance
          .glass,
        "solid",
      );
      assert.equal(
        cms.getResolvedConfigForCustomer("consumer", "another").appearance
          .glass,
        "subtle",
      );
    },
  );
  await t.test("empty banners stay deleted", () => {
    localStorage.setItem("atlas_portal_content_banners_v1", "[]");
    assert.deepEqual(cms.getBanners(), []);
  });
  await t.test(
    "individual config is scoped by both customer and portal",
    () => {
      cms.saveCustomerOverride({
        customerId: "one",
        customerName: "Test",
        portal: "consumer",
        uiTextsOverride: { heroSubtitle: "only consumer" },
        updatedAt: "",
      });
      cms.saveCustomerOverride({
        customerId: "one",
        customerName: "Test",
        portal: "high_volume",
        uiTextsOverride: { heroSubtitle: "only high volume" },
        updatedAt: "",
      });
      assert.equal(
        cms.getResolvedConfigForCustomer("consumer", "one").uiTexts
          .heroSubtitle,
        "only consumer",
      );
      assert.equal(
        cms.getResolvedConfigForCustomer("high_volume", "one").uiTexts
          .heroSubtitle,
        "only high volume",
      );
      cms.deleteCustomerOverride("one", "consumer");
      assert.equal(cms.getCustomerOverride("one", "consumer"), undefined);
      assert.ok(cms.getCustomerOverride("one", "high_volume"));
    },
  );
  await t.test(
    "thresholds, targeting, disabled campaigns, invalid percentages and strongest offer",
    () => {
      localStorage.setItem(
        "atlas_portal_content_banners_v1",
        JSON.stringify([
          banner("all"),
          banner("specific", {
            scope: "individual",
            targetCustomerId: "one",
            cartDiscountPercent: 8,
          }),
          banner("someone-else", {
            scope: "individual",
            targetCustomerId: "other",
            cartDiscountPercent: 99,
          }),
          banner("disabled", { active: false, cartDiscountPercent: 90 }),
          banner("invalid", { cartDiscountPercent: 150 }),
          banner("high", {
            portal: "high_volume",
            cartDiscountPercent: 40,
            targetTierCode: "A",
          }),
        ]),
      );
      assert.equal(cms.getCartDiscountPercent(user, 999), 0);
      assert.equal(cms.getCartDiscountPercent(user, 1000), 8);
      assert.equal(cms.getCartDiscountPercent(null, 10000), 0);
      assert.equal(cms.getCartDiscountPercent(user, NaN), 0);
      assert.equal(
        cms.getCartDiscountPercent({ ...user, approvedB2B: true }, 10000),
        0,
      );
      assert.equal(
        cms.getCartDiscountPercent(
          { ...user, approvedB2B: true, assignedPriceListCode: "A" },
          10000,
        ),
        40,
      );
    },
  );
});
