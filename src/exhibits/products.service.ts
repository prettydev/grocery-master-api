import { Model } from "mongoose";
import { Injectable, HttpService, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { IProduct, ICategory, IFetchProduct } from "./db/product.interface";
import { IExhibit, IAuction, IHistory } from "./db/exhibit.interface";
import { AuctionType, ExhibitType } from "./gql/exhibit.dto";
import { ResType, SimpleProductType } from "../gql_common/types/common.object";
import { PageArgs, Filter } from "../gql_common/types/common.input";

import { map } from "rxjs/operators";
import { ProductType } from "./gql/product.dto";
import { PRICE_ADDITIONAL_RATE } from "../gql_common/utils";
import { ProductInput } from "./gql/product.input";

@Injectable()
export class ProductsService {
  constructor(
    @InjectModel("Product") private readonly productModel: Model<IProduct>,
    @InjectModel("Category") private readonly categoryModel: Model<ICategory>,
    @InjectModel("Exhibit") private readonly exhibitModel: Model<IExhibit>,
    @InjectModel("Auction") private readonly auctionModel: Model<IAuction>,
    @InjectModel("History") private readonly historyModel: Model<IHistory>,
  ) {}

  private readonly httpService: HttpService = new HttpService();
  private readonly logger = new Logger(ProductsService.name);

  getFilter(filter: Filter): any {
    const filterQuery =
      filter.cat === "All"
        ? {
            title: { $regex: filter.key, $options: "i" },
          }
        : {
            title: { $regex: filter.key, $options: "i" },
            "categories.name": filter.cat,
          };

    return filterQuery;
  }

  getSort(filter: Filter): any {
    let sortQuery = {};
    if (filter.sort === "latest") sortQuery = { created_at: -1 };
    else if (filter.sort === "oldest") sortQuery = { created_at: 1 };
    else if (filter.sort === "highest")
      sortQuery = { "buybox_winner.price.value": -1 };
    else if (filter.sort === "lowest")
      sortQuery = { "buybox_winner.price.value": 1 };
    else sortQuery = { created_at: -1 };

    return sortQuery;
  }

  async find(asin: string): Promise<IProduct> {
    return this.productModel.findOne({ asin }).exec();
  }

  async findOneById(id: string): Promise<IProduct> {
    return {} as any;
  }

  async findAll(pageArgs: PageArgs, filter: Filter): Promise<IProduct[]> {
    return this.productModel.find().exec();
  }

  async findAdminProductsAll(
    pageArgs: PageArgs,
    filter: Filter,
  ): Promise<IFetchProduct> {
    const filterQuery = this.getFilter(filter);
    const sortQuery = this.getSort(filter);

    console.log("product filter, sort query:", filterQuery, sortQuery);

    const arr = await this.productModel
      .find(
        filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          sort: sortQuery,
        },
      )
      .exec();

    const cnt = await this.productModel.countDocuments(filterQuery).exec();

    return { arr, cnt };
  }

  async remove(id: string): Promise<boolean> {
    return true;
  }

  //utils, it's needed to exported to the libs
  findCommonElements(arr1: any[], arr2: any[]): boolean {
    const obj = {};
    for (let i = 0; i < arr1.length; i++) {
      if (!obj[arr1[i]]) {
        const element = arr1[i];
        obj[element] = true;
      }
    }
    for (let j = 0; j < arr2.length; j++) {
      if (obj[arr2[j]]) {
        return true;
      }
    }
    return false;
  }

  /**
   * first get the map of [asin, category] from the products collection
   * second find all documents from auction and exhibits and iterate and update the category from the map
   */
  // @Timeout(1000)
  async update_category(): Promise<boolean> {
    const products = await this.productModel.find().exec();
    const auctions = await this.auctionModel.find().exec();
    const exhibits = await this.exhibitModel.find().exec();

    const map = {};
    const cats = [];

    products.map(async (p) => {
      let c = p.categories[0].name;
      if (c === "All Departments") {
        if (p.categories[1]) {
          c = p.categories[1].name;
        } else {
          console.log("strange category....", p.asin);
        }
      }
      map[p.asin] = c;
      cats.push(c);
    });

    const scats = [...new Set(cats)];
    const cat_objs = [];

    scats.map((s) => {
      cat_objs.push({ name: s });
    });

    await this.categoryModel.remove({});
    await this.categoryModel.insertMany(cat_objs);

    console.log(scats);

    auctions.map(async (a) => {
      await a.updateOne({ "product.category": map[a.product.asin] });
    });

    exhibits.map(async (e) => {
      await e.updateOne({ "product.category": map[e.product.asin] });
    });

    console.log("All categories are updated...");

    return true;
  }

  // @Timeout(1000) // update exhibit, auction, history product category, now no need
  async update_category_product_to_aucton_exhibit(): Promise<boolean> {
    const products = await this.productModel.find({}).exec();
    products.map(async (p, idx) => {
      const cats = p.categories.map((c, idy) => {
        return c.name;
      });

      await this.exhibitModel.updateMany(
        { "product.asin": p.asin },
        {
          "product.category": cats,
        },
      );
      await this.auctionModel.updateMany(
        { "product.asin": p.asin },
        {
          "product.category": cats,
        },
      );
      await this.historyModel.updateMany(
        { "product.asin": p.asin },
        {
          "product.category": cats,
        },
      );
      this.logger.error(idx);
    });
    this.logger.warn("updated auction, history category");

    return true;
  }

  // @Timeout(1000), just for once use, so not used now
  async change_auction_exhibit_price(): Promise<void> {
    await this.exhibitModel.updateMany(
      {},
      {
        $mul: { "product.price": PRICE_ADDITIONAL_RATE },
      },
    );
    await this.auctionModel.updateMany(
      {},
      {
        $mul: { "product.price": PRICE_ADDITIONAL_RATE },
      },
    );
    await this.historyModel.updateMany(
      {},
      {
        $mul: { "product.price": PRICE_ADDITIONAL_RATE },
      },
    );

    return;
  }

  /**
   * first get asins from the auctions => auction_asins = []
   * second get asins from the exhibits => exhibits_asins = []
   * third mix two arrays into unique array => first_asins = []
   * forth get asins from the products => second_asins = []
   * fifth get common asins from the first and second asins => common_asins = []
   * repeat for auctions, exhibits, products and check if the asin is exhist in the common_asin, if not delete.
   */
  // @Timeout(1000)
  async check_differences(): Promise<boolean> {
    const auctions = await this.auctionModel.find().exec();
    const auction_asins = [];
    auctions.map((a) => {
      auction_asins.push(a.product.asin);
    });

    const exhibits = await this.exhibitModel.find().exec();
    const exhibit_asins = [];
    exhibits.map((a) => {
      exhibit_asins.push(a.product.asin);
    });

    const products = await this.productModel.find().exec();
    const product_asins = [];
    products.map((a) => {
      product_asins.push(a.asin);
    });

    const exhibit_auction_asins = [...auction_asins, ...exhibit_asins];

    // const simple_asins = [...new Set(exhibit_auction_asins)];//compare auction_exhibit and products
    const simple_asins = [...new Set(exhibit_asins)]; //compare exhibits and products
    const detailed_asins = [...new Set(product_asins)];

    console.log(simple_asins.length, detailed_asins.length);

    const difference = simple_asins.filter((x) => !detailed_asins.includes(x));
    const difference2 = detailed_asins.filter((x) => !simple_asins.includes(x));

    difference.map(async (d) => {
      await this.exhibitModel.deleteOne({ "product.asin": d });
    });

    console.log(
      difference.length + " differences removed from the exhibit:",
      difference,
    );

    difference2.map(async (asin, idx) => {
      await this.product2exhibit(asin);
    });

    console.log(difference2.length + " differences inserted to the exhibit:");

    return true;
  }

  async product2exhibit(asin: string): Promise<boolean> {
    const p: ProductType = await this.productModel.findOne({ asin });
    const new_exhibit = new ExhibitType();
    const new_simple_product = new SimpleProductType();

    new_simple_product.asin = p.asin;
    new_simple_product.title = p.title;
    new_simple_product.link = p.link;
    if (p.categories.length === 0) {
      console.log("strange category...", p.asin);
      return false;
    }
    new_simple_product.category = p.categories.map((c, i) => c.name);
    new_simple_product.image = p.main_image.link;
    new_simple_product.rating = p.rating;
    if (
      !p.buybox_winner ||
      !p.buybox_winner.price ||
      !p.buybox_winner.price.value
    ) {
      console.log("strange price...", p.asin);
      return false;
    }
    new_simple_product.price =
      p.buybox_winner.price.value * PRICE_ADDITIONAL_RATE;

    new_exhibit.product = new_simple_product;
    new_exhibit.funders = [];
    new_exhibit.fund_amount = 0;
    new_exhibit.fund_percent = 0;
    new_exhibit.threshold = 0;

    const new_exhibit_model = new this.exhibitModel(new_exhibit);

    try {
      const et = await new_exhibit_model.save();
      if (!et) console.log("failed to add ebt from products...", p.asin);
      return true;
    } catch (e) {
      console.log("add exhibit exception for ", p.asin);
      return false;
    }
  }

  async product2auction(asin: string): Promise<boolean> {
    const p: ProductType = await this.productModel.findOne({ asin });
    const new_auction = new AuctionType();
    const new_simple_product = new SimpleProductType();

    new_simple_product.asin = p.asin;
    new_simple_product.title = p.title;
    new_simple_product.link = p.link;
    if (p.categories.length === 0) {
      console.log("strange category...", p.asin);
      return false;
    }
    new_simple_product.category = p.categories.map((c, i) => c.name);
    new_simple_product.image = p.main_image.link;
    new_simple_product.rating = p.rating;
    if (
      !p.buybox_winner ||
      !p.buybox_winner.price ||
      !p.buybox_winner.price.value
    ) {
      console.log("strange price...", p.asin);
      return false;
    }
    new_simple_product.price =
      p.buybox_winner.price.value * PRICE_ADDITIONAL_RATE;

    new_auction.product = new_simple_product;
    new_auction.funders = [];
    new_auction.fund_amount = 0;
    new_auction.fund_percent = 0;
    new_auction.threshold = 0;

    new_auction.autos = [];
    new_auction.bidders = [];
    new_auction.watchers = [];
    new_auction.chatters = [];
    new_auction.state = "cool";
    new_auction.timer = 1800; //default timer

    const new_auction_model = new this.auctionModel(new_auction);

    try {
      const et = await new_auction_model.save();
      if (!et) console.log("failed to add auction from products...", p.asin);
      return true;
    } catch (e) {
      console.log("add auction exception for ", p.asin);
      return false;
    }
  }

  // @Timeout(1000)
  async add_exhibit_and_products_from_rainforest(): Promise<void> {
    const key_arr = [
      "Camera accessory kits",
      "Photo papers",
      "GoPro",
      "Home security cameras",
      "Cookbooks, diet books, and recipe books",
      "Biographies and memoirs",
      "Children’s books",
      "Comics",
      "Fictional books",
      "Suspense and thriller books",
      "Exclusive apparels",
      "Stylish shoes",
      "Rhinestone jewelry pieces",
      "Branded makeup products",
      "Beauty products that have natural ingredients",
      "Beauty tools and accessories",
    ];
    this.add_exhibit_from_search("Instant click cameras");
  }

  rainkey = "";

  /**
   * add to the exhibit
   */
  async add_exhibit_from_search(search_term): Promise<void> {
    const params = {
      api_key: this.rainkey,
      type: "search",
      amazon_domain: "amazon.com",
      search_term,
    };

    await this.httpService
      .get("https://api.rainforestapi.com/request", { params })
      .pipe(
        map((res) => {
          console.log(
            "list request info... " + JSON.stringify(res.data.request_info),
          );
          res.data.search_results.map(async (p, i) => {
            if (
              !p ||
              !p.asin ||
              !p.categories ||
              !p.prices ||
              p.categories.length === 0 ||
              p.prices.length === 0
            ) {
              console.log("wrong exhibit info ", i);
              return;
            }

            await this.add_product_from_rainforest(p.asin);

            const new_exhibit = new ExhibitType();
            const new_simple_product = new SimpleProductType();

            new_simple_product.asin = p.asin;
            new_simple_product.title = p.title;
            new_simple_product.link = p.link;
            new_simple_product.category = p.categories[0].name;
            new_simple_product.image = p.image;
            new_simple_product.rating = p.rating;
            new_simple_product.price =
              p.prices[0].value * PRICE_ADDITIONAL_RATE;

            new_exhibit.product = new_simple_product;
            new_exhibit.funders = [];
            new_exhibit.fund_amount = 0;
            new_exhibit.fund_percent = 0;
            new_exhibit.threshold = 0;

            const new_exhibit_model = new this.exhibitModel(new_exhibit);

            try {
              const et = await new_exhibit_model.save();
              if (et) console.log("succeed to add ebt...");
              else console.log("failed to add ebt...");
            } catch (e) {
              console.log(
                "add exhibit exception for ",
                new_simple_product.asin,
              );
            }
            this.logger.verbose(res.data.search_results.length + "====>" + i);
          });
        }),
      )
      .toPromise();
  }

  /**
   * add to the product
   * @param asin
   */
  async add_product_from_rainforest(asin: string): Promise<boolean> {
    if (!asin) {
      console.log("no asin..... ", asin);
      return false;
    }
    const params = {
      api_key: this.rainkey,
      type: "product",
      amazon_domain: "amazon.com",
      asin,
    };
    this.httpService
      .get("https://api.rainforestapi.com/request", { params })
      .pipe(
        map(async (res) => {
          const newProduct = new this.productModel(res.data.product);
          if (!newProduct.buybox_winner && !newProduct.asin) {
            console.log("wrong detailes for ", newProduct.title);
            return false;
          }
          try {
            const np = await newProduct.save();
            if (np) this.logger.debug("succeed to add product---" + asin);
            else this.logger.warn("failed to add product---" + asin);
            return true;
          } catch (e) {
            console.log("add product exception, ", e.toString());
            return false;
          }
        }),
      )
      .toPromise();
  }

  async admin_add_product(p: ProductInput): Promise<boolean> {
    const newProduct = new this.productModel(p);
    if (!newProduct.buybox_winner && !newProduct.asin) {
      console.log("wrong detailes for ", newProduct.title);
      return false;
    }
    try {
      const np = await newProduct.save();
      if (np) this.logger.debug("succeed to add product---" + p.asin);
      else this.logger.warn("failed to add product---" + p.asin);
      return true;
    } catch (e) {
      console.log("add product exception for ", p.asin, e.toString());
      return false;
    }
  }

  async admin_bulk_add_product(products: Array<ProductType>): Promise<ResType> {
    let code:"success"|"error" = "success"; //"error"
    let message = "unexpected";

    let success_cnt = 0;
    let error_cnt = 0;

    const productsProc = products.map(async (p: ProductType, idx) => {
      try {
        const p2: ProductType = {
          buybox_winner: p.buybox_winner,
          feature_bullets: p.feature_bullets,
          title: p.title,
          model_number: p.model_number,
          asin: p.asin,
          link: p.link,
          categories: p.categories.map((c) => ({
            name: c.name,
            link: c.link ? c.link : "",
          })),
          delivery_message: p.delivery_message,
          description: p.description,
          sub_title: p.sub_title,
          has_coupon: p.has_coupon,
          rating: p.rating,
          main_image: p.main_image,
          images: p.images.map((c) => ({
            link: c.link,
            variant: c.variant ? c.variant : "",
          })),
          attributes: p.attributes.map((c) => ({
            name: c.name,
            value: c.value ? c.value : "",
          })),
          specifications: p.specifications.map((c) => ({
            name: c.name,
            value: c.value ? c.value : "",
          })),
          active: true,
        };
        const np = new this.productModel(p2);
        await np.save();
        success_cnt++;
      } catch (e) {
        console.log(`exception for: ${idx}`, e);
        error_cnt++;
      }
    });

    await Promise.all(productsProc)
      .then(() => {
        if (error_cnt >= success_cnt) code = "error";
        message = `Total products: ${products.length}, Succeed: ${success_cnt}, Failed: ${error_cnt}`;
      })
      .catch((e) => {
        console.log("promise catch:", e);
      });

    return { code, message };
  }

  async setActive(asin: string, active: boolean): Promise<IProduct> {
    const updatedProduct = await this.productModel.findOneAndUpdate(
      {
        asin,
      },
      {
        active,
      },
      {
        new: true,
      },
    );

    return updatedProduct;
  }
}
