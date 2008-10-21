<?
class Form_model extends Model {

   function __construct()
   {
      parent::Model();
   }

   
   function get_user_forms($user_id = 1)
   {
#      $query = $this->db->query( '
#   SELECT f.* 
#     FROM sw_forms f 
#LEFT JOIN sw_forms_users fu on fu.form_id = f.id
#    WHERE fu.user_id = '.$user_id.'
# ORDER BY f.id' );
#
#      return $query->result_array();
   }


   function get_group_forms($group_id = 1)
   {
      $query = $this->db->query( '
   SELECT f.* 
     FROM sw_forms f 
LEFT JOIN sw_forms_groups fg on fg.form_id = f.id
    WHERE fg.group_id = '.$group_id.'
 ORDER BY f.id' );

      return $query->result_array();
   }


   function create($code, $name)
   {
      return $this->insert($code, $name);
   }


   function insert($code, $name)
   {
      $Form['code'] = $code;
      $Form['name'] = $name;
      $this->db->where($Form);
      $query = $this->db->get('forms');
      if( $query->num_rows() == 1 )
      {
         return $query->row_array();
      }
      $this->db->insert( 'forms', $Form );
      $Form['id'] = $this->db->insert_id();
      return $Form;
   }


   function save($Form)
   {
      return $this->update($Form['id'], $Form['code'], $Form['name']);
   }
   
   
   function update($id, $code, $name)
   {
      $Form['id'] = $id;
      $this->db->where($Form);
      $Form['code'] = $code;
      $Form['name'] = $name;
      $this->db->update('forms',$Form);
   }

}
?>
