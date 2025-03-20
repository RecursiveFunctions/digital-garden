---
{"dg-publish":true,"permalink":"/site/using-home-assistant-to-replace-wyze/"}
---



I think it would be a worthwhile effort to protect my privacy by using home assistant or some other vendor-agnostic ecosystem, and storing footage locally as opposed to sending it to a company's cloud server. After all, if I don't own the infrastructure, I have no control if they get hacked or a leak occurs. 

Also, I'd rather pay the upfront cost of the hardware rather than pay a continuous subscription.


1. **Physical Control**
    - footage stays on-prem
    - No risk of cloud breaches
    - Full control of data
    - No unexpected data sharing (not to be confused with getting hacked)
2. **Access Control**
    - Only I can access recordings
    - No corporate employees can view footage
    - Complete control over who sees what
3. **Long-term Protection**
    - No subscription dependencies
    - Don't have to worry about TOS shenanigans
    - No risk of service shutdowns
    - privacy settings won't change unexpectedly


```mermaid
flowchart LR
    subgraph Internet["Internet"]
        ISP[ISP]
    end
    
    subgraph Local["Local Network"]
        RT[Router]
        HA[Home Assistant]
        WY[Wyze Camera]
        
        subgraph Features["Available Features"]
            direction TB
            F1["• Live Streaming
            • Motion Detection
            • Camera Controls"]
        end
        
        RT <-->|"Internet Connection"| ISP
        RT <-->|"Network Connection"| HA
        HA <-->|"Local Connection"| WY
        WY --> Features
    end
    
    %% Styling
    classDef ispNode fill:#05203E,stroke:#023E77,stroke-width:3px,color:#ffffff
    classDef rtNode fill:#023E77,stroke:#0983C8,stroke-width:3px,color:#ffffff
    classDef haNode fill:#0983C8,stroke:#5ACAF9,stroke-width:3px,color:#ffffff
    classDef wyNode fill:#5ACAF9,stroke:#BADEEF,stroke-width:3px,color:#ffffff
    classDef featureNode fill:#000000,stroke:#666,stroke-width:1px,color:#ffffff
    classDef connStyle color:#ffffff
    
    class ISP ispNode
    class RT rtNode
    class HA haNode
    class WY wyNode
    class F1 featureNode
    class Local featureNode
    class Internet featureNode
    linkStyle 1,2,3 stroke:#ffffff,stroke-width:2px
```
