import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';
import { ConsumerGroupResultDTO } from 'src/app/shared/models/consumerGroups/consumer-group-result-dto';
import { ConsumerGroupState, FetchConsumerGroups, ReactivateConsumerGroup } from 'src/app/state/consumer-group.state';
import { MetaDataProperty } from 'src/app/shared/models/metadata/meta-data-property';
import { Constants } from 'src/app/shared/constants';

@Component({
  selector: 'app-consumer-group-display',
  templateUrl: './consumer-group-display.component.html',
  styleUrls: ['./consumer-group-display.component.css']
})
export class ConsumerGroupDisplayComponent implements OnInit {
  @Select(ConsumerGroupState.getConsumerGroups) consumerGroups$: Observable<Array<ConsumerGroupResultDTO>>;
  @Select(ConsumerGroupState.getConsumerGroupMetadata) metadata$: Observable<Array<MetaDataProperty>>;

  lifecycleStatusMapping = {
    'https://pid.bayer.com/kos/19050/active': 'Active',
    'https://pid.bayer.com/kos/19050/deprecated': 'Deprecated'
  }

  constructor(private router: Router, private store: Store) { }

  ngOnInit() {
    this.loadConsumerGroups();
  }

  loadConsumerGroups() {
    this.store.dispatch(new FetchConsumerGroups());
  }

  createConsumerGroup() {
    this.router.navigate(['admin/consumerGroups/create']);
  }

  reactivateConsumerGroup(consumerGroup: ConsumerGroupResultDTO) {
    this.store.dispatch(new ReactivateConsumerGroup(consumerGroup.id)).subscribe();
  }

  isActive(consumerGroup: ConsumerGroupResultDTO) {
    return consumerGroup.lifecycleStatus === Constants.ConsumerGroup.LifecycleStatus.Active;
  }

  getStatus(consumerGroup: ConsumerGroupResultDTO) {
    return this.lifecycleStatusMapping[consumerGroup.lifecycleStatus];
  }
}
