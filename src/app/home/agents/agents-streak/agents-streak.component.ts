import { Component, OnInit, Input } from '@angular/core';
import { CommonService, GetOptions } from 'src/app/utils/services/common.service';

@Component({
  selector: 'odp-agents-streak',
  templateUrl: './agents-streak.component.html',
  styleUrls: ['./agents-streak.component.scss']
})
export class AgentsStreakComponent implements OnInit {

  @Input() agent: any;
  constructor(private commonService: CommonService) { }

  ngOnInit(): void {
    const self = this;
    if (self.agent.agentId) {
      self.agent.agentID = self.agent.agentId;
    } else if (self.agent.agentID) {
      self.agent.agentId = self.agent.agentID;
    }
    self.getInteractions();
  }

  getInteractions() {
    const self = this;
    const options: GetOptions = {
      select: 'status',
      filter: {
        $or: [
          { 'flowData.block.meta.source': self.agent.agentID },
          { 'flowData.block.meta.target': self.agent.agentID }
        ]
      },
      count: 5,
      sort: '-completedTimestamp',
      noApp: true
    };
    self.commonService.get('partnerManager', `/${self.commonService.app._id}/agent/utils/interaction`, options).subscribe(res => {
      if (res.length === 0) {
        self.agent.interactions = [];
      } else {
        self.agent.interactions = res.map(e => e.status.charAt(0)).reverse();
        const remain = 5 - self.agent.interactions.length;
        if (remain) {
          for (let i = 0; i < remain; i++) {
            self.agent.interactions.unshift('N');
          }
        }
      }
    }, err => {
      self.agent.streak = [];
    });
  }

}
