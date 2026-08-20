from datetime import datetime
from typing import Dict, Optional
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SiteConfigItem(BaseModel):
    config_key: str
    config_value: str
    description: Optional[str] = None


class SiteConfigBulkUpdate(BaseModel):
    configs: Dict[str, str]


class SiteConfigResponse(SiteConfigItem):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    updated_at: datetime
