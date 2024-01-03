import { LightningElement, api } from 'lwc';

export default class BoatSearchSummary extends LightningElement {

    // public
    @api totalBoats;
    //badgeStyle='slds-hidden'; // default value for badgeStyle 

    // getter for dynamically computing the pluralization of the word 'Boat'
    get boatCountDisplay() {
        return this.totalBoats === 1 ? '1 Boat Available' : this.totalBoats + ' Boats Available';
    }

    // getter for badgeStyle computed according to whether there are boats or not
    get badgeStyle() {

        // determine which styling to apply based on the number of boats
        if (this.totalBoats == null) {
            return 'slds-hidden';
        }
        if (this.totalBoats > 0 && this.totalBoats < 10) {
            return 'slds-badge slds-theme_warning';
        }
        else if (this.totalBoats >= 10) {
            return 'slds-badge slds-theme_success';
        }
        else {
            return 'slds-badge slds-theme_error';
        }
    }


}