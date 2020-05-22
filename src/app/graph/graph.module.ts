import { NgModule } from '@angular/core';
import { GraphComponent } from 'app/graph/graph.component';
import { GraphStore } from 'app/graph/state/graph-store';

@NgModule({
  exports: [GraphComponent],
  declarations: [GraphComponent],
  providers: [GraphStore],
})
export class GraphModule {}
