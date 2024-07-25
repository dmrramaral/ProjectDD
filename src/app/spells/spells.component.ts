import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { MessageModule } from 'primeng/message';
import { ToastModule } from 'primeng/toast';
import { forkJoin } from 'rxjs';
import { Spell } from '../models/spell';
import { SpellsService } from './spells.service';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
@Component({
  selector: 'app-spells',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ToastModule,
    MessageModule,
    DropdownModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    InputNumberModule
  ],
  templateUrl: './spells.component.html',
  styleUrls: ['./spells.component.scss'],
  providers: [MessageService]
})
export class SpellsComponent implements OnInit {

  spellsData: Spell[] = [];
  spellDescriptions: { [key: string]: Spell } = {};
  classesData: any[] = []; // Adiciona a propriedade para armazenar as classes
  selectedClass: string = ''; // Propriedade para armazenar a classe selecionada
  spellsByClass: { [className: string]: Spell[] } = {};
  spellsLoaded: boolean = false;

  filterName!: string;
  filterLevel!: number;
  filterType!: string;
  filterSchool!: string;

  nameOptions: any[] = [];
  levelOptions: any[] = [];
  typeOptions: any[] = [];
  schoolOptions: any[] = [];
  filteredSpells: any[] = []; // Adicionando a propriedade filteredSpells




  constructor(private spellsService: SpellsService,
    private sanitizer: DomSanitizer,
    private messageService: MessageService
  ) { }

  ngOnInit(): void {


    this.getClasses();
    this.initializeSpells();




  }

  initializeFilters() {
    // Inicializar opções de filtros
    console.log(this.spellsData);
    this.nameOptions = this.spellsData.map(spell => ({ name: spell.name }));
    this.levelOptions = this.spellsData.map(spell => ({ level: spell.level }));
    this.schoolOptions = this.spellsData.map(spell => ({ school: spell.school.name }));
    console.log(this.nameOptions);
  }

  applyFilters() {
    this.filteredSpells = this.spellsData.filter(spell => {
      const matchesName = this.filterName ? spell.name.includes(this.filterName) : true;
      const matchesLevel = this.filterLevel ? spell.level === this.filterLevel : true;
      const matchesSchool = this.filterSchool ? spell.school.name.includes(this.filterSchool) : true;
      return matchesName && matchesLevel && matchesSchool;
    });
  }


  formatDescription(description: string[]): SafeHtml {
    const formattedDescription = description.join(' ')
      .replace(/\*\*\*(.*?)\*\*\*/g, '<strong></br>$1</strong>') // Bold
      .replace(/\| (.*?) \|/g, '<table><tr><td>$1</td></tr></table>'); // Table (simplified)

    return this.sanitizer.bypassSecurityTrustHtml(formattedDescription);
  }

  getDamageLevels(damage: any): string[] {
    return Object.keys(damage);
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
        this.initializeFilters();
        this.showToast();
      });
    });
  }

  showToast(): void {
    this.messageService.add({ severity: 'success', summary: 'Spells Loaded', detail: 'The spells have been successfully loaded.' });
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
        this.initializeFilters();
      });
    } else {
      this.spellsData = [];
      console.log("No class selected or no spells for selected class");
    }
  }



}
