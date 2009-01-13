<?php

class Bundle_layout_model extends Model {

	function __construct() {
		parent::Model();
		$this->load->model('Bundle_model', 'bundle');
		$this->load->model('Layout_model', 'layout');
		$this->load->model('Dimension_model', 'dimension');
	}



	function get_list($bundle_id = NULL, $layout_id = NULL) {
		$this->db->select('id, bundle_id, layout_id, dimension_id, position_x, position_y, position_z, start_sec, stop_sec');
		$this->db->from('bundles_layouts');
		$this->db->where('customer_id', $_SESSION['user']['customer_id']);
		if(isset($bundle_id)) $this->db->where('bundle_id', $bundle_id);
		if(isset($layout_id)) $this->db->where('layout_id', $layout_id);
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row) {
				$data[$row['id']] = $row;
			}
		} else {
			foreach($query->field_data() as $row) {
				$data[0][$row->name] = NULL;
			}
			$data[0]['bundle_id'] = $bundle_id;
			$data[0]['layout_id'] = $layout_id;
		}

		return $data;
	}


	function delete($id) {
	   $bundle_id_a = $this->input->post('bundle_id');
	   $bundle_id = $bundle_id_a[$id];
	   $layout_id_a = $this->input->post('layout_id');
	   $layout_id = $layout_id_a[$id];

	   $this->bundle->delete_fs($bundle_id);

		$this->db->where('id', $id);
		$this->db->delete('bundles_layouts');

	   $this->bundle->update_fs($bundle_id);
	   $this->layout->update_fs($layout_id);
	}



	function update() {
		
		$id = $this->input->post('id');
		$bundle_id = $this->input->post('bundle_id');
		$layout_id = $this->input->post('layout_id');
		$position_x = $this->input->post('position_x');
		$position_y = $this->input->post('position_y');
		$position_z = $this->input->post('position_z');
		$start_sec = $this->input->post('start_sec');
		$stop_sec = $this->input->post('stop_sec');
		$dimension_id = $this->input->post('dimension_id');
		
		foreach($id as $key => $value) {
			$data = array(
				'bundle_id' => $bundle_id[$key],
				'layout_id' => $layout_id[$key],
				'position_x' => $position_x[$key],
				'position_y' => $position_y[$key],
				'position_z' => $position_z[$key],
				'start_sec' => $start_sec[$key],
				'stop_sec' => $stop_sec[$key],
				'dimension_id' => $dimension_id[$key]
			);
			
			if($id[$key] > 0) {
				$this->db->where('id', $id[$key]);
				$this->db->update('bundles_layouts', $data);
			} else {
				if($bundle_id[$key] != 0 AND $layout_id[$key] != 0) {
					$data['customer_id'] = $_SESSION['user']['customer_id'];
					$this->db->insert('bundles_layouts', $data);
				}
			}
         $this->bundle->update_fs($data['bundle_id']); // renew bundle file for synchronization with screens
         $this->layout->update_fs($data['layout_id']); // renew bundle file for synchronization with screens
		}
		
	}






	function get_bundles_for_layout( $layout_id )
	{
      if( isset( $this->BundlesForLayout[$layout_id] ) )
      {
         return $this->BundlesForLayout[$layout_id];
      }
		$this->db->select('b.id, b.name, d.dimension_x as width, d.dimension_y as height, bl.position_x, bl.position_y, bl.position_z, bl.start_sec, bl.stop_sec');
		$this->db->from('bundles_layouts AS bl');
		$this->db->join('bundles AS b', 'b.id = bl.bundle_id');
		$this->db->join('dimensions AS d', 'd.id = bl.dimension_id');
		$this->db->where('bl.customer_id', $_SESSION['user']['customer_id']);
		$this->db->where('bl.layout_id', $layout_id);
		$this->db->order_by('bl.start_sec', 'asc'); 
		$this->db->order_by('bl.position_y', 'asc'); // why?
		$this->db->order_by('bl.position_x', 'asc'); // why?
		$query = $this->db->get();

		if($query->num_rows() > 0) {
			foreach($query->result_array() as $row)
			{
				$this->BundlesForLayout[$layout_id][$row['id']] = $row;
				//unset($this->BundlesForLayout[$collection_id][$row['id']]['id']);
			}
		} else {
			$this->BundlesForLayout[$layout_id] = array();
		}

		return $this->BundlesForLayout[$layout_id];
	}

}

?>
