import { Selector, State, StateContext, Action } from '@ngxs/store';
import { tap } from 'rxjs/operators';
import { TaxonomyService } from '../core/http/taxonomy.api.service';
import { TaxonomyResultDTO } from '../shared/models/taxonomy/taxonomy-result-dto';
import { Constants } from '../shared/constants';

export class TaxonomyStateModel {
    taxonomyResults: Map<string, TaxonomyResultDTO[]>;
}

export class FetchTaxonomyList {
    static readonly type = '[Taxonomy] Fetch taxonomy list';
    constructor(public type: string) { }
}


@State<TaxonomyStateModel>({
    name: 'Taxonomy',
    defaults: {
        taxonomyResults: new Map<string, TaxonomyResultDTO[]>()
    }
})

export class TaxonomyState {

    constructor(private taxonomyApiService: TaxonomyService) { }

    @Selector()
    public static getTaxonomyList(state: TaxonomyStateModel) {
        return state.taxonomyResults;
    }

    @Action(FetchTaxonomyList)
    fetchTaxonomyList(state: StateContext<TaxonomyStateModel>, action: FetchTaxonomyList) {
        if (!state.getState().taxonomyResults.has(action.type) || action.type === Constants.ResourceTypes.Keyword) {
            return this.taxonomyApiService.getTaxonomyList(action.type).pipe(tap((res: TaxonomyResultDTO[]) => {
                var taxonomy: Map<string, TaxonomyResultDTO[]> = state.getState().taxonomyResults;

                taxonomy.set(action.type, res);
                state.patchState({
                    taxonomyResults: new Map<string, TaxonomyResultDTO[]>(taxonomy)
                });
            }));
        }
    }
}
