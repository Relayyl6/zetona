import { describe, it, expect, beforeEach } from "vitest";
import { getAllTestimonials, saveTestimonial } from "@/lib/db/data-store";
import { getInitials } from "@/components/home/TestimonialsSection";
import { TestimonialDTO } from "@/lib/db/queries";

describe("Testimonials & Review Submission System", () => {
  it("computes initials correctly for various author name formats", () => {
    expect(getInitials("Laurent Shaha")).toBe("LS");
    expect(getInitials("Chukwuemeka Obi")).toBe("CO");
    expect(getInitials("Zetona")).toBe("ZE");
    expect(getInitials("Aminat Bello")).toBe("AB");
    expect(getInitials("")).toBe("");
  });

  it("filters out pending/unapproved testimonials for public website views", async () => {
    const testReview: TestimonialDTO = {
      id: `test_pending_${Date.now()}`,
      author: "Test Client",
      quote: "Amazing photo session in Benin City!",
      visible: false,
      status: "pending",
      sortOrder: 99,
    };

    await saveTestimonial(testReview);

    // Public call (no includeAll option) must NOT include pending reviews
    const publicList = await getAllTestimonials();
    const foundInPublic = publicList.find((t) => t.id === testReview.id);
    expect(foundInPublic).toBeUndefined();

    // Admin call (with includeAll: true) MUST include the pending review
    const adminList = await getAllTestimonials({ includeAll: true });
    const foundInAdmin = adminList.find((t) => t.id === testReview.id);
    expect(foundInAdmin).toBeDefined();
    expect(foundInAdmin?.status).toBe("pending");
    expect(foundInAdmin?.visible).toBe(false);
  });

  it("publishes the review once approved by admin", async () => {
    const reviewId = `test_approve_${Date.now()}`;
    const initialReview: TestimonialDTO = {
      id: reviewId,
      author: "Approved Client",
      quote: "Incredible attention to natural light.",
      visible: false,
      status: "pending",
      sortOrder: 10,
    };

    await saveTestimonial(initialReview);

    // Admin approves the review
    const approvedReview: TestimonialDTO = {
      ...initialReview,
      visible: true,
      status: "approved",
    };
    await saveTestimonial(approvedReview);

    // Now it appears in public testimonials
    const publicList = await getAllTestimonials();
    const found = publicList.find((t) => t.id === reviewId);
    expect(found).toBeDefined();
    expect(found?.visible).toBe(true);
  });
});
