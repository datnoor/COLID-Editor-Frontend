import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Observable } from 'rxjs';
import { ResourceState, RejectResourceMarkedAsDeleted, FetchResourceMarkedAsDeleted, DeleteResources } from 'src/app/state/resource.state';
import { Select, Store } from '@ngxs/store';
import { ResourceOverviewCTO } from 'src/app/shared/models/resources/resource-overview-cto';
import { MatSelectionListChange, MatSelectionList } from '@angular/material/list';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { ResourceOverviewDTO } from 'src/app/shared/models/resources/resource-overview-dto';
import { ColidMatSnackBarService } from 'src/app/modules/colid-mat-snack-bar/colid-mat-snack-bar.service';
import { DeletionRequestDialogComponent } from '../deletion-request-dialog/deletion-request-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-deletion-request',
  templateUrl: './deletion-request.component.html',
  styleUrls: ['./deletion-request.component.scss']
})
export class DeletionRequestComponent implements OnInit {
  @Select(ResourceState.getIsResourcesMarkedDeletedLoading) loading$: Observable<boolean>;
  @Select(ResourceState.getResourcesMarkedDeleted) resources$: Observable<ResourceOverviewCTO>;
  @ViewChild("deletionRequests", { static: false }) deletionRequests: MatSelectionList;
  selectedDeletionRequests: ResourceOverviewDTO[] = [];
  //---------This is for paginator----------//
  pageSize=10;
  lowValue:number = 0;
  highValue:number = 10;  
//-----------------------------------------//
  constructor(private store: Store, private _snackbar: ColidMatSnackBarService, public dialog: MatDialog) { }

  ngOnInit() {
    this.store.dispatch(new FetchResourceMarkedAsDeleted()).subscribe();
  }

  get selectedDeletionRequestUris(): string[] {
    return this.selectedDeletionRequests.map(item => item.pidUri)
  }

  reject() {
    const dialogRef = this.dialog.open(DeletionRequestDialogComponent, {
      data: {
        header: 'Reject colid entry',
        requests: this.selectedDeletionRequests
      },
      width: 'auto',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new RejectResourceMarkedAsDeleted(this.selectedDeletionRequestUris)).subscribe(
          res => {
            this._snackbar.success('Reject successful', 'The entries have been rejected.')
          });
        }
    });
  }

  delete() {
    const dialogRef = this.dialog.open(DeletionRequestDialogComponent, {
      data: {
        header: 'Delete colid entry',
        requests: this.selectedDeletionRequests
      },
      width: 'auto',
      disableClose: true
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.store.dispatch(new DeleteResources(this.selectedDeletionRequestUris)).subscribe(res => {
          this._snackbar.success('Deletion successful', 'The entries have been deleted.')
        });
      }
    });
  }

  get allSelected(): boolean {
    return this.deletionRequests == null ? false : this.deletionRequests.options.length === this.deletionRequests.selectedOptions.selected.length
  }

  get someSelected(): boolean {
    return this.deletionRequests == null ? false : this.deletionRequests.selectedOptions.selected.length !== 0;
  }

  get selectedItemLength(): number {
    return this.deletionRequests.selectedOptions.selected.length;
  }

  handleSelectionChanged(event: MatSelectionListChange) {
    this.selectedDeletionRequests = event.source.selectedOptions.selected.map(item => item.value);
  }

  handleCheckboxChanged(event: MatCheckboxChange) {
    if (event.checked) {
      this.deletionRequests.selectAll();
    } else {
      this.deletionRequests.deselectAll();
    }
    this.selectedDeletionRequests = this.deletionRequests.selectedOptions.selected.map(item => item.value);
  }
 //Used for pagination change event
  getPaginatorData(event){
    this.lowValue = event.pageIndex * event.pageSize; //from start
    this.highValue = this.lowValue + event.pageSize; //to end
    // if deleted request is select and chnage pageIndex or pagesizeso intialization delete request. 
    this.deletionRequests.deselectAll();
    this.selectedDeletionRequests = this.deletionRequests.selectedOptions.selected.map(item => item.value);
  }
}

