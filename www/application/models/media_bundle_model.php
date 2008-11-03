<?php

class Media_bundle_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Media_model', 'media');
		$this->load->model('Bundle_model', 'bundle');
	}



	function get_list($media_id = NULL, $bundle_id = NULL) {
		$this->db->select('id, media_id, bundle_id, frequency, appearances, importance, probability, valid_from_date, valid_to_date');
		$this->db->from('medias_bundles');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		if(isset($media_id)) $this->db->where('media_id', $media_id);
		if(isset($bundle_id)) $this->db->where('bundle_id', $bundle_id);
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
				unset($data[$row['id']]['id']);
				$data[$row['id']]['media'] = $this->media->get_name($row['media_id']);
				$data[$row['id']]['bundle'] = $this->bundle->get_name($row['bundle_id']);
			}
		} else {
			$data = array();
		}

		return $data;
	}

}

?>
