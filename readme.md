# Daggerheart Tool Workspace

This workspace contains three main folders:

## 1. `frontend`
The React-based web application for browsing and searching the Daggerheart SRD compendium.  
It provides a user-friendly interface to explore abilities, domains, items, and more.

## 2. `backend`
The backend service that serves the SRD data as an API.  
It reads the processed JSON data and exposes endpoints for search and filtering.

## 3. `tools`
Utility scripts for processing and updating the SRD data.  
Notably, `daggerheart_converter.py` clones the SRD Markdown repository, parses the files, and generates a combined JSON file for the backend.

---

## Data Source

All compendium data is sourced from the  [Daggerheart SRD](https://github.com/seansbox/daggerheart-srd.git) repository.  
This workspace periodically pulls updates from that repo and converts the Markdown files into structured JSON for use in the app.


---

## SYSTEM REFERENCE DOCUMENT 1.0

**SRD Writer: Rob Hebert | Technical Editor: Shawn Banerjee | Layout: Matt Paquette & Co. | Producer: Madigan Hunt**

This document, including the Witherwild Campaign Frame, is considered Public Game Content per the Darrington Press Community Gaming License. Please read the Darrington Press Community Gaming License before using this material.

© 2025 Critical Role LLC. All rights reserved. For more information, please visit [www.darringtonpress.com/license](http://www.darringtonpress.com/license).