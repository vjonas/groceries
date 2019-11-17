import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OverviewComponent } from './overview/overview.component';
import { RouterModule } from '@angular/router';
import { GroceriesComponent } from './overview/groceries/groceries.component';

const routes = [
  {
    path: '',
    component: OverviewComponent,
  },
  {
    path: 'groceries',
    component: GroceriesComponent,
  },
];

@NgModule({
  declarations: [OverviewComponent, GroceriesComponent],
  imports: [RouterModule.forChild(routes), CommonModule],
  exports: [RouterModule],
})
export class HomeModule {}
