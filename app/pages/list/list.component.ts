import {Component, ChangeDetectionStrategy, OnInit} from "@angular/core";
import {Router} from "@angular/router";
import {EventData} from "data/observable";
import {alert} from "ui/dialogs";
import {TextField} from "ui/text-field";
import {topmost} from "ui/frame";

import {Grocery} from "../../shared/grocery/grocery";
import {GroceryListService} from "../../shared/grocery/grocery-list.service";
import {setHintColor} from "../../utils/hint-util";

var socialShare = require("nativescript-social-share");

import { registerElement } from "nativescript-angular/element-registry";
registerElement("PullToRefresh", () => require("nativescript-pulltorefresh").PullToRefresh);

@Component({
  selector: "list",
  templateUrl: "pages/list/list.html",
  providers: [GroceryListService],
  styleUrls: ["pages/list/list-common.css", "pages/list/list.css"]
})
export class ListComponent implements OnInit {
  groceryList: Array<Grocery> = [];
  grocery: string;
  isLoading: boolean;

  constructor(
    private _groceryListService: GroceryListService,
    private _router: Router) {

    this.grocery = "";
    this.isLoading = true;
  }

  ngOnInit() {
    this.load();
  }

  load() {
    this._groceryListService.load()
      .subscribe(loadedGroceries => {
        loadedGroceries.forEach((groceryObject) => {
          this.groceryList.unshift(groceryObject);
          var pullToRefresh = <any>topmost().currentPage.getViewById("pull-to-refresh");
          pullToRefresh.refreshing = false;
        });
      });
  }

  setHintColor(args: EventData) {
    var grocery = <TextField>args.object;
    setHintColor({ view: grocery, color: "#FFFFFF" });
  }

  add() {
    // Check for empty submissions
    var groceryTextField = <TextField>topmost().currentPage.getViewById("grocery");
    if (this.grocery.trim() === "") {
      alert({
        message: "Enter a grocery item",
        okButtonText: "OK"
      });
      return;
    }

    // Dismiss the keyboard
    groceryTextField.dismissSoftInput();

    this._groceryListService.add(this.grocery)
      .subscribe(
        groceryObject => {
          this.groceryList.unshift(groceryObject);
          this.grocery = "";
        },
        () => {
          alert({
            message: "An error occurred while adding an item to your list.",
            okButtonText: "OK"
          });
          this.grocery = "";
        }
      )
  }

  share() {
    var list = [];
    for (var i = 0, size = this.groceryList.length; i < size ; i++) {
      list.push(this.groceryList[i].name);
    }
    var listString = list.join(", ").trim();
    socialShare.shareText(listString);
  }

  refreshList() {
    while (this.groceryList.length) {
      this.groceryList.pop();
    }
    this.load();
  }
}
