import * as mongoose from "mongoose";

const GrocerySchema = new mongoose.Schema({
  name: {$type: String, unique: true},
  domain: {$type: String, unique: true},
  second_lang: String,
  mobile: String,  
  owner_email: String,  
  bank_account: String,
  contact_email: String,
  contact_phone: String,
  opening_hours: Number,
  delivery_radius: Number,
  min_order: Number,
  first_offer_discount: Number,  
  is_collect: { $type: Boolean, default: false },
  logo: {
    link: String,
  },
  images: [
    {
      link: String,
      variant: String,
    },
  ],  
  location: {
    address: String,
    lng: Number,
    lat: Number,
  }, 
  credit_card: {
    card_number: String,
    expired_date: String,
    cvv: String
  },    
    description: [{ lang: String, value: String }],
    delivery_policy: [{ lang: String, value: String }],
    about_us: [{ lang: String, value: String }],  
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    typeKey: "$type"
  },  
);

GrocerySchema.pre("save", function (next) {
  next();
});

/**
 * only for root category
 */
const CategorySchema = new mongoose.Schema({
  name: { $type: String, required: true, unique: true },
}, {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
    typeKey: "$type"
});

export { GrocerySchema, CategorySchema };
