import { Model } from "mongoose";
import { Injectable, HttpService, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { IGrocery, IFetchGrocery } from "./db/grocery.interface";
import { PageArgs, Filter } from "../gql_common/types/common.input";

import { GroceryInput } from "./gql/grocery.input";

@Injectable()
export class GroceriesService {
  constructor(
    @InjectModel("Grocery") private readonly groceryModel: Model<IGrocery>,    
  ) {}

  private readonly httpService: HttpService = new HttpService();
  private readonly logger = new Logger(GroceriesService.name);

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

    return {owner_email:filter.email};//filterQuery;
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

  async findOneById(id: string): Promise<IGrocery> {
    return {} as any;
  }

  async findAll(
    pageArgs: PageArgs,
    filter: Filter,
  ): Promise<IFetchGrocery> {
    const filterQuery = this.getFilter(filter);
    const sortQuery = this.getSort(filter);

    console.log("product filter, sort query:", filterQuery, sortQuery);

    const arr = await this.groceryModel
      .find(
        filterQuery,
        {},
        {
          skip: pageArgs.skip,
          limit: pageArgs.take,
          // sort: sortQuery,
        },
      )
      .exec();

    const cnt = await this.groceryModel.countDocuments(filterQuery).exec();

    return { arr, cnt };
  }

async findTopAll(): Promise<IGrocery[]> {
    
    const arr = await this.groceryModel
      .find(
        {},
        {},
        {},
      )
      .exec();

    return arr;
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

  async add_grocery(g: GroceryInput): Promise<boolean> {
    const newGrocery = new this.groceryModel(g);
    try {
      const np = await newGrocery.save();
      return np?true:false;
    } catch (e) {
      console.log("exeption while adding grocery...", e);
      return false;
    }
  }
  
}
