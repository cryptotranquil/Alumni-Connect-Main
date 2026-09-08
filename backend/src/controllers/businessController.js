const businessService = require("../services/businessService");
const userService = require("../services/userService");

const formatBusiness = (b, ownerUser, reviewCount) => {
  if (!b) return null;
  const biz = { ...b };
  biz._id = biz.id; delete biz.id;
  if (ownerUser) biz.owner = { _id: ownerUser.id, name: `${ownerUser.firstname || ""} ${ownerUser.lastname || ""}`.trim() };
  if (biz.createdAt?.toDate) biz.createdAt = biz.createdAt.toDate().toISOString();
  if (biz.updatedAt?.toDate) biz.updatedAt = biz.updatedAt.toDate().toISOString();
  if (reviewCount !== undefined) biz.reviewCount = reviewCount;
  return biz;
};
const formatReview = (r, reviewerUser) => {
  if (!r) return null;
  const rev = { ...r };
  rev._id = rev.id; delete rev.id;
  if (reviewerUser) rev.reviewer = { _id: reviewerUser.id, name: `${reviewerUser.firstname || ""} ${reviewerUser.lastname || ""}`.trim() };
  if (rev.createdAt?.toDate) rev.createdAt = rev.createdAt.toDate().toISOString();
  return rev;
};

exports.listBusinesses = async (req, res) => {
  const businesses = await businessService.listAll();
  const owners = await Promise.all(businesses.map((b) => userService.findById(b.ownerId)));
  res.json({ success: true, businesses: businesses.map((b, i) => formatBusiness(b, owners[i])) });
};

// exports.getBusiness = async (req, res) => {
//   const business = await businessService.findById(req.params.id);
//   if (!business) return res.status(404).json({ success: false, message: "Business not found" });
//   const owner = await userService.findById(business.ownerId);
//   const publishedReviews = await businessService.listReviewsForBusiness(business.id, "published");
//   const reviewers = await Promise.all(publishedReviews.map((r) => userService.findById(r.reviewerId)));
//   res.json({ success: true, business: formatBusiness(business, owner, publishedReviews.length), reviews: publishedReviews.map((r, i) => formatReview(r, reviewers[i])) });
// };

// exports.createBusiness = async (req, res) => {
//   if (req.user.role !== "alumni") return res.status(403).json({ success: false, message: "Only alumni can list a business" });
//   const { name, description, location, phone, email, website, services } = req.body;
//   const business = await businessService.createBusiness({
//     name: name.trim(), description: description?.trim() || "", location: location?.trim() || "",
//     phone: phone || "", email: email || "", website: website || null,
//     services: Array.isArray(services) ? services : [], ownerId: req.user.userId,
//   });
//   const owner = await userService.findById(req.user.userId);
//   res.status(201).json({ success: true, business: formatBusiness(business, owner) });
// };

// exports.updateBusiness = async (req, res) => {
//   const business = await businessService.findById(req.params.id);
//   if (!business) return res.status(404).json({ success: false, message: "Business not found" });
//   if (business.ownerId !== req.user.userId && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Not allowed" });

//   const { name, description, location, phone, email, website, services } = req.body;
//   const patch = {};
//   if (name !== undefined) patch.name = name.trim();
//   if (description !== undefined) patch.description = description.trim();
//   if (location !== undefined) patch.location = location.trim();
//   if (phone !== undefined) patch.phone = phone;
//   if (email !== undefined) patch.email = email;
//   if (website !== undefined) patch.website = website;
//   if (Array.isArray(services)) patch.services = services;

//   await businessService.updateBusiness(req.params.id, patch);
//   const updated = await businessService.findById(req.params.id);
//   const owner = await userService.findById(updated.ownerId);
//   res.json({ success: true, business: formatBusiness(updated, owner) });
// };

exports.deleteBusiness = async (req, res) => {
  const business = await businessService.findById(req.params.id);
  if (!business) return res.status(404).json({ success: false, message: "Business not found" });
  if (business.ownerId !== req.user.userId && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Not allowed" });
  await businessService.deleteBusiness(req.params.id);
  res.json({ success: true, message: "Business deleted" });
};

exports.createReview = async (req, res) => {
  const business = await businessService.findById(req.params.id);
  if (!business) return res.status(404).json({ success: false, message: "Business not found" });
  if (business.ownerId === req.user.userId) return res.status(403).json({ success: false, message: "You cannot review your own business" });
  const review = await businessService.createReview(req.params.id, req.user.userId, req.body.comment.trim());
  const reviewer = await userService.findById(req.user.userId);
  res.status(201).json({ success: true, message: "Review submitted for moderation", review: formatReview(review, reviewer) });
};

exports.deleteReview = async (req, res) => {
  const review = await businessService.findReviewById(req.params.reviewId);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });
  if (review.reviewerId !== req.user.userId && req.user.role !== "admin") return res.status(403).json({ success: false, message: "Not allowed" });
  await businessService.deleteReview(req.params.reviewId);
  res.json({ success: true, message: "Review deleted" });
};

exports.listPendingReviews = async (req, res) => {
  const reviews = await businessService.listPendingReviews();
  const businesses = await Promise.all(reviews.map((r) => businessService.findById(r.businessId)));
  const reviewers = await Promise.all(reviews.map((r) => userService.findById(r.reviewerId)));
  res.json({ success: true, reviews: reviews.map((r, i) => ({ ...formatReview(r, reviewers[i]), business: businesses[i] ? { _id: businesses[i].id, name: businesses[i].name } : null })) });
};

exports.moderateReview = async (req, res) => {
  const { status } = req.body;
  if (!["published", "rejected"].includes(status)) return res.status(400).json({ success: false, message: "Status must be published or rejected" });
  const review = await businessService.findReviewById(req.params.reviewId);
  if (!review) return res.status(404).json({ success: false, message: "Review not found" });
  await businessService.updateReviewStatus(req.params.reviewId, status);
  res.json({ success: true, message: `Review ${status}` });
};

exports.createBusiness = async (req, res) => {


  try {

    const { name, location, category, description, contact_email, contact_phone } = req.body;
   
    // const names = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // const existing = await Business.findOne({ req.body });
    // if (existing) {
    //   return res.status(400).json({ error: 'A business with this name already exists.' });
    // }
    const status = "pending";

    const business = await Business.create({
      name: name.trim(),
      location: location,
      category: category,
      description: description.trim(),
      contact_email: contact_email,
      contact_phone: contact_phone,
      status,
      posted_by: req.user.userId,

      
    });

    res.status(201).json({ success: true, business: "business" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getMyBusinesses = async (req, res) => {
  try {
    // console.log(req.user);
    const ownerId = req.user.userId;
    const businesses = await Business.find({ posted_by: ownerId });
    // // console.log(businesses.name);
    res.status(200).json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getBusiness = async (req, res) => {
  try {

    const business_id = req.params.business_id;
    const business = await Business.find({ _id: business_id });
    res.status(200).json(business);
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllBusinesses = async (req, res) => {
  try {
    const businesses = await Business.find().sort({ createdAt: -1 });
    res.json(businesses);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBusiness = async (req, res) => {
  console.log("files", req.files, req.params.business_id);
  // next();
  const updatedData = {
    ...req.body,
  }

  const logo = req.files?.logo?.[0];
  const banner = req.files?.banner?.[0];
  console.log(req.body);
  updatedData.banner = logo? `/uploads/${logo.name}`: undefined;
  updatedData.logo = banner? `/uploads/${banner.name}`: undefined;

 
  const business = await Business.findByIdAndUpdate(req.params.business_id, { $data: updatedData }, {
    new:true
  });
  if (!business) {
    return res.status(404).json({ success: false, message: "Business not found" });
  }

  return res.status(200).json({ success: true, message: "Business found" });

}
