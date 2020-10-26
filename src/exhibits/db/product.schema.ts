import * as mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  asin: { type: String, required: true, unique: true },
  title: String,
  // first_available: { raw: String, utc: String },
  model_number: String,
  link: String,
  // variants: [
  //   {
  //     asin: String,
  //     title: String,
  //     link: String,
  //   },
  // ],
  categories: [
    {
      name: String,
      link: String,
    },
  ],
  delivery_message: String,
  description: String,
  sub_title: {
    text: String,
    link: String,
  },
  has_coupon: Boolean,
  rating: Number,
  main_image: {
    link: String,
  },
  images: [
    {
      link: String,
      variant: String,
    },
  ],
  // images_count: Number,
  feature_bullets: [String],
  // feature_bullets_count: Number,
  // feature_bullets_flat: String,
  attributes: [{ name: String, value: String }],
  buybox_winner: {
    condition: { is_new: Boolean },
    price: { symbol: String, value: Number, currency: String, raw: String },
    shipping: {
      symbol: String,
      value: Number,
      currency: String,
      raw: String,
    },
  },
  specifications: [{ name: String, value: String }],
  // specifications_flat: String,

  active: { type: Boolean, default: true },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

ProductSchema.pre("save", function (next) {
  next();
});

/**
 * only for root category
 */
const CategorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
});

export { ProductSchema, CategorySchema };
