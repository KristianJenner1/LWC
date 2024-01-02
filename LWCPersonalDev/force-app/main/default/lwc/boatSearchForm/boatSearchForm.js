// imports
import { LightningElement, track, wire } from 'lwc';
import getBoatTypes from '@salesforce/apex/BoatDataService.getBoatTypes';
import getMaxBoatLength from '@salesforce/apex/BoatDataService.getMaxBoatLength';

// constants
const MAX_PRICE = 1000000;

export default class BoatSearchForm extends LightningElement {
    
    // Private
    selectedBoatTypeId = '';
    error = undefined;
    searchOptions;
    maxPrice = MAX_PRICE;
    
    // Wire the Apex method getBoatTypes to populate searchOptions
    @wire(getBoatTypes) 
    boatTypes({ error, data }) {
        if (data) {
            this.searchOptions = data.map(type => {
                return { label: type.Name, value: type.Id };
            });
            this.searchOptions.unshift({ label: 'All Types', value: '' });
            this.error = undefined;
        } else if (error) {
            this.searchOptions = undefined;
            this.error = error;
        }
    }

    // Wire the Apex method getMaxBoatLength to populate maxLength
    @wire(getMaxBoatLength) maxLength;
    
    // Fires event that the search option has changed.
    // passes boatTypeId (value of this.selectedBoatTypeId) in the detail
    handleSearchOptionChange(event) {
        // set selectedBoatTypeId to the value of the selected search option
        this.selectedBoatTypeId = event.detail.value;
        // Create the const searchEvent and dispatch this event with the selected boat type Id, this event will be handled by the parent component
        const searchEvent = new CustomEvent('search', { 
            detail: { 
                boatTypeId: this.selectedBoatTypeId,
                maxPrice: this.maxPrice,
                maxLength: this.maxLength.data
            } 
        });
        this.dispatchEvent(searchEvent);
    }

    handleMaxPriceChange(event) {
        // set maxPrice to the value of the selected search option
        this.maxPrice = event.detail.value;
        // Create the const searchEvent and dispatch this event with the selected boat type Id, this event will be handled by the parent component
        const searchEvent = new CustomEvent('search', { 
            detail: { 
                boatTypeId: this.selectedBoatTypeId,
                maxPrice: this.maxPrice,
                maxLength: this.maxLength.data
            } 
        });
        this.dispatchEvent(searchEvent);
    }
    
    handleMaxLengthChange(event) {
        // set maxLength to the value of the selected search option
        this.maxLength.data = event.detail.value;
        // Create the const searchEvent and dispatch this event with the selected boat type Id, this event will be handled by the parent component
        const searchEvent = new CustomEvent('search', { 
            detail: { 
                boatTypeId: this.selectedBoatTypeId,
                maxPrice: this.maxPrice,
                maxLength: this.maxLength.data
            } 
        });
        this.dispatchEvent(searchEvent);
    }

  }
  