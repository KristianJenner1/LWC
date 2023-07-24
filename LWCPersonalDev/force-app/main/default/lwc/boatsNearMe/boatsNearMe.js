// imports
import { LightningElement, wire, api } from 'lwc';
import { showToastEvent } from 'lightning/platformShowToastEvent';

// import the getBoatsByLocation method from the BoatDataService Apex class
import getBoatsByLocation from '@salesforce/apex/BoatDataService.getBoatsByLocation';

// constants
const LABEL_YOU_ARE_HERE = 'You are here!';
const ICON_STANDARD_USER = 'standard:user';
const ERROR_TITLE = 'Error loading Boats Near Me';
const ERROR_VARIANT = 'error';

export default class BoatsNearMe extends LightningElement {

    // public
    @api boatTypeId;
    
    mapMarkers = [];
    
    isLoading = true;
    isRendered = false;

    // user's location
    latitude;
    longitude;
    
    // Add the wired method from the Apex Class
    // Name it getBoatsByLocation, and use latitude, longitude and boatTypeId
    // Handle the result and calls createMapMarkers
    @wire(getBoatsByLocation, { latitude: '$latitude', longitude: '$longitude', boatTypeId: '$boatTypeId' })
    wiredBoatsJSON({error, data}) { 
        if (data) {
            // Call createMapMarkers
            this.createMapMarkers(data);
            this.isLoading = false;
        } else if (error) {
            // Disply error message in toast
            this.dispatchEvent(
                new showToastEvent({
                    title: ERROR_TITLE,
                    message: error.message,
                    variant: ERROR_VARIANT
                })
            );
        }
    }
    
    // Controls the isRendered property
    // Calls getLocationFromBrowser()
    renderedCallback() { 
        if (!this.isRendered) {
            this.getLocationFromBrowser();
        }
        this.isRendered = true;
    }
    
    // Gets the location from the Browser
    // position => {latitude and longitude}
    getLocationFromBrowser() {
        if (navigator.geolocation) { 
            navigator.geolocation.getCurrentPosition(
                position => {
                    this.latitude = position.coords.latitude;
                    this.longitude = position.coords.longitude;
                }
            );
        }
    }
    
    // Creates the map markers
    createMapMarkers(boatData) {
        const newMarkers = boatData.map(boat => {
            return {
                location: {
                    Latitude: boat.Geolocation__Latitude__s,
                    Longitude: boat.Geolocation__Longitude__s
                },
                title: boat.Name
            };
        });
        // add label to the first marker for the user's location
        newMarkers.unshift({
            location: {
                Latitude: this.latitude,
                Longitude: this.longitude
            },
            title: LABEL_YOU_ARE_HERE,
            icon: ICON_STANDARD_USER
        });
        // assign this.mapMarkers to newMarkers
        this.mapMarkers = newMarkers;
    }

}