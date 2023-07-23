import { NgModule } from '@angular/core';
import { GraphComponent } from 'app/graph/graph.component';
import { GraphStore } from 'app/graph/state/graph-store';

@NgModule({
    imports: [GraphComponent],
    exports: [GraphComponent],
    providers: [GraphStore],
})
export class GraphModule {}
