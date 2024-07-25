import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Spell } from '../models/spell';
import { SpellsService } from './spells.service';
import { forkJoin } from 'rxjs';
@Component({
  selector: 'app-spells',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  templateUrl: './spells.component.html',
  styleUrls: ['./spells.component.scss']
})
export class SpellsComponent implements OnInit {

  spellsData: Spell[] = [];
  spellDescriptions: { [key: string]: Spell } = {};
  classesData: any[] = []; // Adiciona a propriedade para armazenar as classes
  selectedClass: string = ''; // Propriedade para armazenar a classe selecionada
  spellsByClass: { [className: string]: Spell[] } = {};
  spellsLoaded: boolean = false;


  constructor(private spellsService: SpellsService) { }

  ngOnInit(): void {


    this.getClasses();
    this.initializeSpells();


  }



  initializeSpells() {
    this.spellsService.getData().subscribe((data: any) => {
      const spellDetailsObservables = data.results.map((spell: any) =>
        this.spellsService.getDescription(spell.url)
      );

      forkJoin<Spell[]>(spellDetailsObservables).subscribe((spellDetailsArray: Spell[]) => {
        spellDetailsArray.forEach((spellDetails: Spell) => {
          spellDetails.classes.forEach((cls: any) => {
            if (!this.spellsByClass[cls.index]) {
              this.spellsByClass[cls.index] = [];
            }
            this.spellsByClass[cls.index].push(spellDetails);
          });
        });

        this.spellsLoaded = true;
        this.sortSpellsByLevel();
        console.log("Spells foram carregados com sucesso.");
        console.log(this.spellsByClass);
      });
    });
  }



  sortSpellsByLevel() {
    for (let className in this.spellsByClass) {
      this.spellsByClass[className].sort((a, b) => a.level - b.level);
    }
  }

  getClassNames(spell: Spell): string {
    return spell.classes.map(c => c.name).join(', ');
  }

  getSubclassNames(spell: Spell): string {
    return spell.subclasses.map(sc => sc.name).join(', ');
  }

  getClasses() {
    this.spellsService.getClasses().subscribe((data: any) => {
      this.classesData = data.results;
      console.log(this.classesData);
    });
  }

  filterSpellsByClass() {
    if (this.selectedClass && this.spellsByClass[this.selectedClass]) {
      this.spellsData = this.spellsByClass[this.selectedClass];
      this.spellsData.forEach(spell => {
        this.spellsService.getDescription(spell.url).subscribe(data => {
          this.spellDescriptions[spell.url] = data;
        });
      });
    } else {
      this.spellsData = [];
      console.log("No class selected or no spells for selected class");
    }
  }



}
