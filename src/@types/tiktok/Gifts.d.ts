interface Gift {
  can_put_in_gift_box: boolean;
  color_infos: any[];
  combo: boolean;
  describe: string;
  diamond_count: number;
  duration: number;
  expiration_timestamp: number;
  for_linkmic: boolean;
  gift_label_icon: ImageInfo;
  gift_label_type: number;
  gift_rank_recommend_info: string;
  gift_skin_to_gift_texts_infos: any[];
  gift_skins: any[];
  gift_sub_type: number;
  gift_texts: any[];
  gift_vertical_scenarios: number[];
  gold_effect: string;
  group_in_tab: number;
  icon: ImageInfo;
  id: number;
  image: ImageInfo;
  is_box_gift: boolean;
  is_broadcast_gift: boolean;
  is_displayed_on_panel: boolean;
  is_effect_befview: boolean;
  is_gallery_gift: boolean;
  is_random_gift: boolean;
  lock_info: LockInfo;
  name: string;
  primary_effect_id: number;
  tracker_params: Record<string, unknown>;
  type: number;
}

interface ImageInfo {
  avg_color: string;
  height: number;
  image_type: number;
  is_animated: boolean;
  open_web_url: string;
  uri: string;
  url_list: string[];
  width: number;
}

interface LockInfo {
  gift_level: number;
  lock: boolean;
  lock_type: number;
}
