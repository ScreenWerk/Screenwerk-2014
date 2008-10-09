<?
class Bundle_model extends Model {

   function __construct()
   {
      parent::Model();
//      $this->load->model('Layout_model','Layout',TRUE);
   }
   
   
   
   function find($id)
   {
      $this->db->where('id='.$id);
      $query = $this->db->get( 'bundles' );
      return $query->row_array();
   }
   
   
   
   function involved_medias($id)
   {
      $_im2 = array();
      
      $query = $this->db->query( 'SELECT m.filename, mb.valid_from_date, mb.valid_to_date FROM sw_medias m 
left join sw_medias_bundles mb on mb.media_id = m.id
where mb.bundle_id = '.$id.'
order by m.filename' );

      $_im1 = $query->result_array();
      
      foreach( $_im1 as $_im )
      {
         $_im2[$_im['filename']] = $_im;
      }

      return $_im2;
   }
   
   
   
   function playlist($id)
   {
      $BundledMedias = $this->list_bundled_medias($id);
#      var_dump($BundledMedias);
      return ($BundledMedias);
   }      
    
    
    
   function list_bundled_medias($id)
   {
      if( isset( $this->ListBundledMedias[$id] ) ) return $this->ListBundledMedias[$id];
      $ret_medias = array();
      
      $query = $this->db->query( 'SELECT mb.id, m.id as media_id, m.type, m.filename, m.length, mb.frequency, mb.appearances, mb.importance, mb.probability, mb.valid_from_date, mb.valid_to_date FROM sw_medias m 
left join sw_medias_bundles mb on mb.media_id = m.id
where mb.bundle_id = '.$id.'
order by mb.importance desc' );
      foreach( $query->result_array() as $_media )
      {
         $_id = $_media['id'];
         unset( $_media['id'] );
         $ret_medias[$_id] = $_media;
      }
      $this->ListBundledMedias[$id] = $ret_medias;
      return $ret_medias;
   }
   
   
   
   function list_medias_excl($id)
   {
      $ret_medias = array();

      $query = $this->db->query( 'SELECT id, type, filename FROM sw_medias
where id not in
( SELECT distinct m.id FROM sw_medias m 
left join sw_medias_bundles mb on mb.media_id = m.id
where mb.bundle_id = '.$id.' )
order by filename' );
      foreach( $query->result_array() as $_media )
      {
         $ret_medias[$_media['id']] = $_media['filename'];
      }
      return $ret_medias;
   }
   
   
   
   function add_media()
   {
      $BundledMedia['bundle_id'] = $_POST['id'];
      $BundledMedia['media_id'] = $_POST['media_id'];
      $BundledMedia['frequency'] = $_POST['frequency'];
      $BundledMedia['appearances'] = $_POST['appearances'];
      $BundledMedia['importance'] = $_POST['importance'];
      $BundledMedia['probability'] = $_POST['probability'];
      $BundledMedia['valid_from_date'] = $_POST['valid_from_date'];
      $BundledMedia['valid_to_date'] = $_POST['valid_to_date'];
      $this->db->insert( 'medias_bundles', $BundledMedia );
   }
   
   
   
   function remove_bundledmedia( $bundled_media_id )
   {
      $BundledMedia['id'] = $bundled_media_id;
      $this->db->delete( 'medias_bundles', $BundledMedia );
   }
   
   
   //
   // Remove media from all bundles
   //
   function remove_media( $media_id )
   {
      $BundledMedia['media_id'] = $media_id;
      $this->db->delete( 'medias_bundles', $BundledMedia );
   }
   
   
   
   function delete($id)
   {
      $LB['bundle_id'] = $id;
      $this->db->delete( 'bundles_layouts', $LB );

      $B['id'] = $id;
      $this->db->delete( 'bundles', $B );
   }
   
   
   
   function get_last_ten()
   {
      $query = $this->db->get('bundles', 10);
      return $query->result_array();
   }



   function create($name)
   {
      return $this->insert($name);
   }



   function insert($name)
   {
      $Bundle['name'] = $name;
      $this->db->where($Bundle);
      $query = $this->db->get('bundles');
      if( $query->num_rows() == 1 )
      {
         return $query->row_array();
      }
      $this->db->insert( 'bundles', $Bundle );
      $Bundle['id'] = $this->db->insert_id();
      return $Bundle;
   }



   function save($Bundle)
   {
      return $this->update($Bundle['id'],$Bundle['name']);
   }
   
   function update($id,$name)
   {
      $Bundle['id'] = $id;
      $this->db->where($Bundle);
      $Bundle['name'] = $name;
      $this->db->update('bundles',$Bundle);
   }

}
?>
