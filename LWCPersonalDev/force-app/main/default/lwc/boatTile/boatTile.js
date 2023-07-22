// imports
import { LightningElement, api } from 'lwc';

// constants to hold the class values to be used when setting the tileClass
const TILE_WRAPPER_SELECTED_CLASS = 'tile-wrapper selected';
const TILE_WRAPPER_UNSELECTED_CLASS = 'tile-wrapper';

export default class BoatTile extends LightningElement {
    
    // public
    @api boat;
    @api selectedBoatId;
    
    // Getter for dynamically setting the background image for the picture
    // The return of this function must be a string that contains the background-image:url() function, showing the boat picture from the field Picture__c on the Boat__c object
    get backgroundStyle() { 
        return `background-image:url(${this.boat.Picture__c})`;
    }
    
    // Getter for dynamically setting the tile class based on whether the
    // current boat is selected
    get tileClass() { 
        if (this.boat.Id === this.selectedBoatId) {
            // return the tile class with the selected class
            return TILE_WRAPPER_SELECTED_CLASS;
        } else {
            // return the tile class only
            return TILE_WRAPPER_UNSELECTED_CLASS;
        }
    }
    
    // Fires event with the Id of the boat that has been selected.
    // The event is then handled by the parent component (boatSearchResults) and propagated using the message service
    selectBoat() { 
        // set selectedBoatId to the Id of the boat that was clicked
        this.selectedBoatId = this.boat.Id;
        // create boatselect event with the selected boat Id, this event will be handled by the parent component
        const boatselect = new CustomEvent('boatselect', { 
            detail: {
                boatId : this.selectedBoatId
            } 
        });
        // dispatch the boatselect event
        this.dispatchEvent(boatselect);
    }

  }
  